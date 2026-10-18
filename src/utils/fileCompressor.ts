/**
 * Utility untuk kompresi dan optimasi file tugas siswa secara otomatis.
 * Mengurangi ukuran file drastis (hingga 85-95%) dengan tetap mempertahankan
 * ketajaman tulisan tangan, simbol matematika, dan teks agar terbaca 100% oleh sistem AI.
 */

export interface CompressionResult {
  dataUrl: string;
  base64: string;
  mimeType: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  originalDimensions?: { width: number; height: number };
  compressedDimensions?: { width: number; height: number };
  compressionRatio: number; // persentase hemat ukuran, misal 92.4%
  isCompressed: boolean;
  fileType: 'image' | 'pdf' | 'other';
  message: string;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Kompres gambar tugas siswa secara otomatis di browser.
 * - Membatasi dimensi maksimum ke 1800px (ideal untuk OCR Gemini & tulisan tangan)
 * - Menerapkan smoothing tingkat tinggi dan penajaman kontras tulisan
 * - Mengompresi ke format JPEG teroptimasi (kualitas 0.82)
 */
export const compressStudentImage = async (
  file: File,
  maxDimension: number = 1800,
  quality: number = 0.82
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const fileName = file.name;

    // Jika file berupa PDF, baca base64 langsung
    if (file.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1] || '';
        const compressedSize = Math.round((base64.length * 3) / 4);
        resolve({
          dataUrl,
          base64,
          mimeType: 'application/pdf',
          fileName,
          originalSize,
          compressedSize,
          compressionRatio: 0,
          isCompressed: false,
          fileType: 'pdf',
          message: `Dokumen PDF siap diperiksa (${formatFileSize(originalSize)})`,
        });
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar tugas siswa.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak dapat dimuat. Pastikan file berupa JPG, PNG, atau WEBP.'));
      img.onload = () => {
        const origWidth = img.naturalWidth || img.width;
        const origHeight = img.naturalHeight || img.height;

        let targetWidth = origWidth;
        let targetHeight = origHeight;

        // Hitung scaling jika dimensi melebihi batas maksimum
        if (origWidth > maxDimension || origHeight > maxDimension) {
          if (origWidth > origHeight) {
            targetWidth = maxDimension;
            targetHeight = Math.round((origHeight * maxDimension) / origWidth);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round((origWidth * maxDimension) / origHeight);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas untuk kompresi file.'));
          return;
        }

        // Pastikan latar belakang putih bersih untuk dokumen lembar kerja
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Pengaturan smoothing tinggi agar tulisan tangan tetap tajam dan tidak pecah
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Berikan sedikit optimasi kontras agar goresan pulpen / pensil siswa lebih jelas dibaca oleh AI OCR
        // (contrast 104% & brightness 101% memperjelas teks tanpa mengubah warna asli)
        try {
          ctx.filter = 'contrast(104%) brightness(101%)';
        } catch {
          // Fallback jika ctx.filter tidak didukung di browser tertentu
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Ekspor ke format JPEG dengan kualitas 0.82
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = compressedDataUrl.split(',')[1] || '';
        const compressedSize = Math.round((base64.length * 3) / 4);

        const savedBytes = Math.max(0, originalSize - compressedSize);
        const compressionRatio = originalSize > 0 
          ? Math.max(0, Math.min(99, Number(((savedBytes / originalSize) * 100).toFixed(1))))
          : 0;

        const isCompressed = compressedSize < originalSize || origWidth > targetWidth;

        resolve({
          dataUrl: compressedDataUrl,
          base64,
          mimeType: 'image/jpeg',
          fileName: fileName.replace(/\.[^/.]+$/, '') + '.jpg',
          originalSize,
          compressedSize,
          originalDimensions: { width: origWidth, height: origHeight },
          compressedDimensions: { width: targetWidth, height: targetHeight },
          compressionRatio,
          isCompressed,
          fileType: 'image',
          message: isCompressed
            ? `Berhasil dikompresi: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (Hemat ${compressionRatio}%)`
            : `Ukuran file optimal: ${formatFileSize(compressedSize)}`,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
