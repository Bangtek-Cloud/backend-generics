import { FastifyReply, FastifyRequest } from "fastify";
import { WebServices, WebRouteServices } from "./web.services";
import { createMinioClient } from "../../../utils/minio";
import crypto from 'crypto';


export async function createWebsiteHandler(request: FastifyRequest, reply: FastifyReply) {
    const minioClient = createMinioClient(request.server);
    const bucketName = "content";
    const { user } = request;

    try {
        const parts = request.parts();
        const websiteData: any = {};
        const files: { fieldname: string; buffer: Buffer; filename: string }[] = [];

        for await (const part of parts) {
            if (part.type === "file") {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) chunks.push(chunk);

                const buffer = Buffer.concat(chunks);
                const filename = part.filename!;
                files.push({ fieldname: part.fieldname, buffer, filename });
            } else {
                websiteData[part.fieldname] = part.value;
            }
        }
        if (!websiteData.type) {
            return reply.status(400).send({ success: false, error: "Type is required" });
        }
        if (!websiteData.url) {
            return reply.status(400).send({ success: false, error: "URL is required" });
        }

        const type = websiteData.type;
        const show = websiteData.show === 'true';

        const routeId = websiteData.url;

        // 1. Hitung order dari jumlah item sebelumnya
        const existing = await WebServices.countWebsiteViewByRouteId(routeId);
        const order = existing + 1;

        // 2. Upload semua file ke MinIO dan ganti filenamenya di websiteData
        const uploadedFiles: Record<string, string> = {};
        for (const file of files) {
            const ext = file.filename.split('.').pop();
            const newName = `${crypto.randomUUID()}.${ext}`;
            await minioClient.putObject(bucketName, newName, file.buffer, file.buffer.length);
            uploadedFiles[file.fieldname] = `${bucketName}/${newName}`;
        }

        // 3. Build `content` sesuai dengan tipe
        let content: any[] = [];

        if (['1', '2', '3'].includes(type)) {
            content = [
                { type: 'text', value: websiteData['content[0][column1]'] },
                { type: 'image', image: process.env.S3_URL + uploadedFiles['files[0]'] }
            ];
        }

        else if (type === '4') {
            const children: any[] = [];
            for (let i = 0; websiteData[`content[0][items][${i}][title]`]; i++) {
                children.push({
                    value: websiteData[`content[0][items][${i}][title]`],
                    image: process.env.S3_URL + uploadedFiles[`itemFiles[0][${i}]`] // yang diupload sebelumnya
                });
            }
            content = [
                { type: 'header', value: websiteData['content[0][column1]'] },
                { type: 'description', value: websiteData['content[0][column2]'] },
                { type: 'item', children }
            ];
        }

        else if (type === '5' || type === '6') {
            const children: any[] = [];
            for (let i = 0; websiteData[`content[0][items][${i}][title]`]; i++) {
                children.push({
                    title: websiteData[`content[0][items][${i}][title]`],
                    value: process.env.S3_URL + uploadedFiles[`itemFiles[0][${i}]`]
                });
            }
            content = [
                { type: 'header', value: websiteData['content[0][column1]'] },
                { type: 'description', value: websiteData['content[0][column2]'] },
                { type: 'item', children }
            ];
        }

        // 4. Simpan ke DB
        await WebServices.createWebsiteView({
            type: Number(type),
            show,
            routeId,
            order,
            content
        });

        return reply.status(201).send({ success: true, message: "Website content berhasil dibuat" });

    } catch (err) {
        console.error("Error creating website:", err);
        return reply.status(500).send({ success: false, error: "Gagal membuat data, coba lagi" });
    }
}

export async function updateWebsiteHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const minioClient = createMinioClient(request.server);
    const bucketName = "content";
    const { user } = request;

    try {
        // 1. Get the existing website section data first
        const existingWebsite = await WebServices.getWebsiteViewById(id);
        if (!existingWebsite) {
            return reply.status(404).send({ success: false, error: "Website section not found" });
        }

        // 2. Process the incoming multipart data
        const parts = request.parts();
        const websiteData: any = {};
        const files: { fieldname: string; buffer: Buffer; filename: string }[] = [];

        for await (const part of parts) {
            if (part.type === "file") {
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) chunks.push(chunk);

                const buffer = Buffer.concat(chunks);
                const filename = part.filename!;
                files.push({ fieldname: part.fieldname, buffer, filename });
            } else {
                websiteData[part.fieldname] = part.value;
            }
        }

        // 3. Basic validation
        if (!websiteData.type) {
            return reply.status(400).send({ success: false, error: "Type is required" });
        }
        if (!websiteData.url) {
            return reply.status(400).send({ success: false, error: "URL is required" });
        }

        const type = websiteData.type;
        const show = websiteData.show === 'true';
        const routeId = websiteData.url;

        // 4. Upload any new files to MinIO and track the uploaded files
        const uploadedFiles: Record<string, string> = {};
        for (const file of files) {
            const ext = file.filename.split('.').pop();
            const newName = `${crypto.randomUUID()}.${ext}`;
            await minioClient.putObject(bucketName, newName, file.buffer, file.buffer.length);
            uploadedFiles[file.fieldname] = `${bucketName}/${newName}`;
          }
          
          console.log('Uploaded files:', uploadedFiles);
        // 5. Build the updated content based on the type
        let content: any[] = [];

        if (['1', '2', '3'].includes(type)) {
            const textValue = websiteData['content[0][column1]'];
            let imageUrl = websiteData['content[0][column2]']; // bisa URL lama atau file name baru
        
            // Kalau ada file baru yang diupload, override nilai imageUrl
            if (uploadedFiles['files[0]']) {
                imageUrl = process.env.S3_URL + uploadedFiles['files[0]'];
            }
        
            content = [
                { type: 'text', value: textValue },
                { type: 'image', image: imageUrl }
            ];
        }
        

        else if (type === '4') {
            content = [
                { type: 'header', value: websiteData['content[0][column1]'] },
                { type: 'description', value: websiteData['content[0][column2]'] }
            ];
        }

        else if (type === '5' || type === '6') {
            const children: any[] = [];
            // Count how many items we have
            let itemCount = 0;
            while (websiteData[`content[0][items][${itemCount}][title]`] !== undefined) {
                itemCount++;
            }

            for (let i = 0; i < itemCount; i++) {
                const title = websiteData[`content[0][items][${i}][title]`];
                let value;
              
                if (type === '5') {
                  const isNewFile = websiteData[`content[0][items][${i}][value]`];
                  console.log('isNewFile:', isNewFile);
                  const fileKey = `itemFiles[0][${i}]`;
                  console.log('checking fileKey:', fileKey, 'uploadedFiles:', uploadedFiles[fileKey]);
                  console.log('uploadedFiles[fileKey]:', uploadedFiles[fileKey]);
              
                  if (isNewFile && uploadedFiles[fileKey]) {
                    value = `${process.env.S3_URL}${uploadedFiles[fileKey]}`;
                  } else {
                    value = websiteData[`content[0][items][${i}][value]`];
                  }
                } else {
                  value = websiteData[`content[0][items][${i}][value]`];
                }
              
                children.push({ title, value });
              }
              

            content = [
                { type: 'header', value: websiteData['content[0][column1]'] },
                { type: 'description', value: websiteData['content[0][column2]'] },
                { type: 'item', children }
            ];
        }

        // 6. Update the website section in the database
        // Maintain the same order that was already set
        const updatedWebsiteSection = await WebServices.updateWebsiteView(id, {
            show,// Keep the existing order
            content
        });

        return reply.status(200).send({
            success: true,
            message: "Website section updated successfully",
            data: updatedWebsiteSection
        });

    } catch (err) {
        console.error("Error updating website section:", err);
        return reply.status(500).send({ success: false, error: "Failed to update website section, please try again" });
    }
}


export async function getAllWebsiteSectionsHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const websiteSections = await WebServices.getAllWebsiteView();
        return reply.status(200).send({ success: true, data: websiteSections });
    } catch (error) {
        return reply.status(500).send({ success: false, error: "Gagal mengambil data, silahkan coba lagi nanti" });
    }
}

export async function getWebsiteSectionByIdHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const websiteSection = await WebServices.getWebsiteViewById(id);
    return reply.status(200).send({ success: true, data: websiteSection });
}

export async function getWebsiteSectionByRouteIdHandler(request: FastifyRequest, reply: FastifyReply) {
    const { path } = request.params as { path: string };
    const websiteRoute = await WebRouteServices.getWebsiteRoutePath(path);
    if (!websiteRoute) {
        return reply.status(404).send({ success: false, error: "URL tidak ditemukan" });
    }
    const websiteSection = await WebServices.getWebsiteViewByRouteId(websiteRoute.id);
    return reply.status(200).send({ success: true, data: websiteSection });
}

export async function deleteWebsiteSectionHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const existingWebsiteSection = await WebServices.getWebsiteViewById(id);
    if (!existingWebsiteSection) {
        return reply.status(404).send({ success: false, error: "Data tidak ditemukan" });
    }
    const websiteSection = await WebServices.deleteWebsiteView(id);
    return reply.status(200).send({ success: true, data: websiteSection });
}


export async function createWebsiteRouteHandler(request: FastifyRequest, reply: FastifyReply) {
    const { path, url } = request.body as { path: string, url: string };

    const existingRoute = await WebRouteServices.getWebsiteRouteByUrl(url);

    if (existingRoute) {
        return reply.status(400).send({ success: false, error: "URL sudah ada" });
    }

    const websiteRoute = await WebRouteServices.createWebsiteRoute({ path, url });

    if (!websiteRoute) {
        return reply.status(400).send({ success: false, error: "Gagal membuat data, silahkan coba lagi nanti" });
    }

    return reply.status(201).send({ success: true, message: "Berhasil membuat data" });
}

export async function getAllWebsiteRouteHandler(request: FastifyRequest, reply: FastifyReply) {
    const websiteRoutes = await WebRouteServices.getWebsiteRoute();
    return reply.status(200).send({ success: true, data: websiteRoutes });
}

export async function updateWebsiteRouteHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { path, url } = request.body as { path: string, url: string };
    const existingRoute = await WebRouteServices.getWebsiteRouteByPath(url, id);
    if (existingRoute) {
        return reply.status(400).send({ success: false, error: "URL sudah ada" });
    }
    const websiteRoute = await WebRouteServices.updateWebsiteRoute(id, { path, url });
    return reply.status(200).send({ success: true, data: websiteRoute });
}

export async function deleteWebsiteRouteHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const websiteRoute = await WebRouteServices.deleteWebsiteRoute(id);
    return reply.status(200).send({ success: true, data: websiteRoute });
}

export async function getWebsiteRouteByIdHandler(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const websiteRoute = await WebRouteServices.getWebsiteRouteById(id);
    return reply.status(200).send({ success: true, data: websiteRoute });
}
