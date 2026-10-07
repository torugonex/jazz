// サイトの組み立て設定。記事の追加・編集では触る必要はありません。
import markdownIt from "markdown-it";
const md = markdownIt({ html: true, breaks: true, linkify: true });

function youtubeId(url) {
  if (!url) return "";
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : "";
}

function spotifyEmbed(url) {
  if (!url) return "";
  const m = String(url).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : "";
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });

  eleventyConfig.addFilter("youtubeId", youtubeId);
  eleventyConfig.addFilter("spotifyEmbed", spotifyEmbed);

  // 記事中の短い文章（コメント欄など）をMarkdownとして表示する
  eleventyConfig.addFilter("md", (text) => (text ? md.render(String(text)) : ""));
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addFilter("dateJa", (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}年${x.getMonth() + 1}月${x.getDate()}日`;
  });

  // 曲の記事（src/tunes/*.md）には自動で曲ページの体裁とアドレスを付ける
  const isTune = (d) => d.page.inputPath.includes("/tunes/");
  eleventyConfig.addGlobalData("eleventyComputed", {
    layout: (d) => (isTune(d) ? "tune.njk" : d.layout),
    permalink: (d) => (isTune(d) ? (d.draft ? false : `/tunes/${d.page.fileSlug}/`) : d.permalink),
  });

  eleventyConfig.addCollection("tunes", (api) =>
    api.getFilteredByGlob("src/tunes/*.md").filter((p) => !p.data.draft).sort((a, b) => b.date - a.date)
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
