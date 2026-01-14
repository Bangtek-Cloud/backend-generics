-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "caption" TEXT,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hero" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subTitle" TEXT,
    "image" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);
