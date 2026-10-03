export type ArticleBlock =
  | {
    type: "heading";
    level: 2 | 3 | 4;
    content: string;
  }
  | {
    type: "paragraph";
    content: string;
  }
  | {
    type: "quote";
    content: string;
    attribution?: string;
  }
  | {
    type: "list";
    style: "unordered" | "ordered";
    items: string[];
  }
  | {
    type: "divider";
  }
  | {
    type: "hero";
    image: string;
    alt: string;
  }
  | {
    type: "meta-list";
    items: string[];
  }
  | {
    type: "cta";
    heading: string;
    subtitle: string;
  }
  | {
    type: "html";
    content: string;
  };

export type ArticleRegion = "india" | "europe" | "southeast-asia" | "japan" | "middle-east" | "americas" | "general";
export type ArticleTripType = "city-walk" | "heritage" | "beach" | "nature" | "product-guide";

export type Article = {
  slug: string;
  title: string;
  date: string;
  author: string;
  authorTitle: string;
  coverImage: string;
  excerpt: string;
  tags: string[];
  featured?: boolean;
  region?: ArticleRegion;
  tripType?: ArticleTripType;
  blocks: ArticleBlock[];
};
