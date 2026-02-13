import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useReparationStore } from "@/lib/store";
import { useBrands } from "@/hooks/use-brands";
import { useProductModels } from "@/hooks/use-product-models";

export const useSummaryLayout = () => {
  const {
    deviceType,
    brand,
    model,
    selectedIssues,
    description,
    accessories,
    password,
    depositReceived,
    scheduledDate,
  } = useReparationStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Determine current step based on the pathname
  let currentStep = 1;
  if (pathname.includes("/repairs/add/issues")) {
    currentStep = 2;
  } else if (pathname.includes("/repairs/add/client")) {
    currentStep = 3;
  } else if (pathname.includes("/repairs/add/payment")) {
    currentStep = 4;
  }

  // Fetch data from backend for names
  const { data: brandsData } = useBrands();
  const { data: modelsData } = useProductModels(brand);

  const brands = brandsData || [];
  const models = modelsData?.results || [];

  const getBrandName = (brandId: string) => {
    const brandNumId = parseInt(brandId);
    const brandObj = brands.find((b) => b.id === brandNumId);
    return brandObj ? brandObj.name : brandId;
  };

  const getModelName = (modelId: string) => {
    const modelNumId = parseInt(modelId);
    const modelObj = models.find((m) => m.id === modelNumId);
    return modelObj ? modelObj.name : modelId;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    deviceType,
    brand,
    model,
    selectedIssues,
    description,
    accessories,
    password,
    depositReceived,
    scheduledDate,
    isScrolled,
    currentStep,
    getBrandName,
    getModelName,
  };
};
