import React from "react";

const components: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  IndexPage: React.lazy(() => import("@/pages/trading/trading-page")),
  NewsPage: React.lazy(() => import("@/pages/news/news-page")),
  PricingPage: React.lazy(() => import("@/pages/pricing")),
  BlogPage: React.lazy(() => import("@/pages/blog")),
  AboutPage: React.lazy(() => import("@/pages/about")),
} as const;

const getComponent = (componentName: keyof typeof components) => {
  const Component = components[componentName];

  if (!Component) {
    throw new Error(`Component "${componentName}" not found`);
  }

  return Component;
};

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Vite + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Trading",
      href: "/",
      component: getComponent("IndexPage"),
    },
    {
      label: "News",
      href: "/news",
      component: getComponent("NewsPage"),
    },
    {
      label: "Pricing",
      href: "/pricing",
      component: getComponent("PricingPage"),
    },
    {
      label: "Blog",
      href: "/blog",
      component: getComponent("BlogPage"),
    },
    {
      label: "About",
      href: "/about",
      component: getComponent("AboutPage"),
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/frontio-ai/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
