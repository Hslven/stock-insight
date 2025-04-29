import { Route, Routes } from "react-router-dom";
import { Suspense } from "react";

import { DefaultLayout } from "@/layouts/default";
import { siteConfig, type SiteConfig } from "@/config/site";

function App() {
  return (
    <DefaultLayout>
      <Routes>
        {siteConfig.navItems.map((item: SiteConfig["navItems"][number]) => {
          const Component = item.component;

          return (
            <Route
              key={item.label}
              element={
                <Suspense>
                  <Component />
                </Suspense>
              }
              path={item.href}
            />
          );
        })}
      </Routes>
    </DefaultLayout>
  );
}

export default App;
