
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import XBarChart from "@/components/XBarChart";
import XBarRChart from "@/components/XBarRChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pb-12">
      <header className="pt-8 pb-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 neon-text">
          Statistical Process Control Calculator
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto px-4">
          Analyze your quality control data with X-Bar Charts and X-Bar R Charts to monitor process stability and identify improvement opportunities
        </p>
      </header>
      
      <main className="container mx-auto px-4">
        <Tabs defaultValue="xbar" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger 
                value="xbar" 
                className="data-[state=active]:bg-black/60 data-[state=active]:text-neon-blue data-[state=active]:shadow-[0_0_10px_theme(colors.neon.blue)]"
              >
                X-Bar Chart (Mean)
              </TabsTrigger>
              <TabsTrigger 
                value="xbarr" 
                className="data-[state=active]:bg-black/60 data-[state=active]:text-neon-blue data-[state=active]:shadow-[0_0_10px_theme(colors.neon.blue)]"
              >
                X-Bar R Chart
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex justify-center">
            <TabsContent value="xbar" className="w-full flex justify-center">
              <XBarChart />
            </TabsContent>
            <TabsContent value="xbarr" className="w-full flex justify-center">
              <XBarRChart />
            </TabsContent>
          </div>
        </Tabs>

        <section className="mt-12 max-w-4xl mx-auto glass-card p-6">
          <h2 className="text-2xl font-bold mb-4 neon-text">About Statistical Process Control</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Statistical Process Control (SPC) is a method for quality control that uses statistical methods to monitor and control a process. 
              This helps ensure the process operates efficiently, producing more specification-conforming products with less waste.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-neon-blue">X-Bar Chart (Mean)</h3>
                <p className="text-sm">
                  X-Bar Charts monitor the process mean using samples taken at regular intervals. 
                  They track the average of measurements and can detect shifts in the process average over time.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-neon-blue">X-Bar R Chart</h3>
                <p className="text-sm">
                  X-Bar R Charts use both the sample means (X-Bar) and ranges (R) to monitor process average and variation.
                  This provides insights into both central tendency and process consistency.
                </p>
              </div>
            </div>
            <p className="text-sm mt-4 text-gray-400">
              This calculator helps you analyze your quality control data and visualize the results with interactive charts. 
              Use it to identify whether your process is in statistical control and make data-driven decisions for process improvement.
            </p>
          </div>
        </section>
      </main>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Statistical Process Control Calculator</p>
        <p className="mt-1">Designed for quality control professionals and engineers</p>
      </footer>
    </div>
  );
};

export default Index;
