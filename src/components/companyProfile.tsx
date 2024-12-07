import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const CompanyProfile = ({ data }: { data: any }) => {
  const { marketData, esgData, associations } = data;

  

  // Implement scoring logic here
  const ethicalScore = calculateEthicalScore(esgData, associations);

  if (!data) {
    return <div></div>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>{marketData?.name}</CardTitle>
          <CardDescription>{marketData.exchange}</CardDescription>
        </CardHeader>
        <CardContent>Ethical Score: {ethicalScore} / 100</CardContent>
        {/* <CardFooter>
          <p>Card Footer</p>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default CompanyProfile;

export const calculateEthicalScore = (esgData: any, associations: any) => {
  let score = 0;

  // Example scoring based on ESG data
  if (esgData && esgData.environmentalScore) {
    score += esgData.environmentalScore * 0.4;
  }

  if (esgData && esgData.socialScore) {
    score += esgData.socialScore * 0.3;
  }

  if (esgData && esgData.governanceScore) {
    score += esgData.governanceScore * 0.2;
  }

  // Adjust score based on controversies
  if (esgData && esgData.controversies) {
    score -= esgData.controversies * 0.1;
  }

  // Adjust score based on associations
  // For simplicity, deduct points if associated with unethical industries
  //   const unethicalAssociations = associations.filter((assoc) =>
  //     ["Tobacco", "Weapons", "Gambling"].includes(assoc.industry)
  //   );

  //   score -= unethicalAssociations.length * 5;

  // Ensure the score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};
