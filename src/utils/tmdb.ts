export function getTmdbImageUrl(
  path: string | null | undefined,
  type: "poster" | "backdrop" = "poster"
): string {
  if (!path) return "";
  
  // Nếu path đã là một URL đầy đủ (bắt đầu bằng http) thì trả về nguyên bản
  if (path.startsWith("http")) return path;

  const baseUrl =
    type === "poster"
      ? "https://image.tmdb.org/t/p/w500"
      : "https://image.tmdb.org/t/p/original";

  // Nối path vào baseUrl, đảm bảo có dấu "/" ở giữa nếu cần
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
