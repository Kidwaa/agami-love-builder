import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/vendor/react-i18next";

interface LanguageTabsProps {
  render: (lang: "en" | "bn") => React.ReactNode;
}

export function LanguageTabs({ render }: LanguageTabsProps) {
  const { i18n } = useTranslation();
  const [value, setValue] = React.useState<"en" | "bn">(i18n.language as "en" | "bn");

  const handleChange = (next: string) => {
    const lang = next as "en" | "bn";
    setValue(lang);
    void i18n.changeLanguage(lang);
  };

  return (
    <Tabs value={value} onValueChange={handleChange} className="w-full">
      <TabsList>
        <TabsTrigger value="en">EN</TabsTrigger>
        <TabsTrigger value="bn">BN</TabsTrigger>
      </TabsList>
      <TabsContent value="en">{render("en")}</TabsContent>
      <TabsContent value="bn">{render("bn")}</TabsContent>
    </Tabs>
  );
}
