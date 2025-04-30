
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Calculator } from "lucide-react";

interface PChartData {
  sample: number;
  defective: number;
  inspected: number;
  proportion: number;
  ucl: number;
  lcl: number;
  cl: number;
}

const PChart = () => {
  const [samples, setSamples] = useState<PChartData[]>([]);
  const [defective, setDefective] = useState<string>("");
  const [inspected, setInspected] = useState<string>("");
  const [sampleCount, setSampleCount] = useState<number>(1);
  const [results, setResults] = useState({
    pBar: 0,
    cl: 0,
    ucl: 0,
    lcl: 0,
    outOfControl: false
  });
  
  const calculatePChart = () => {
    if (!defective || !inspected) {
      return;
    }
    
    const defectiveValue = parseInt(defective);
    const inspectedValue = parseInt(inspected);
    
    if (isNaN(defectiveValue) || isNaN(inspectedValue) || inspectedValue <= 0) {
      return;
    }
    
    const proportion = defectiveValue / inspectedValue;
    
    // Add new sample
    const newSample: PChartData = {
      sample: sampleCount,
      defective: defectiveValue,
      inspected: inspectedValue,
      proportion,
      ucl: 0, // Will be calculated after we update samples
      lcl: 0, // Will be calculated after we update samples
      cl: 0,  // Will be calculated after we update samples
    };
    
    const newSamples = [...samples, newSample];
    
    // Calculate p-bar (average proportion)
    const totalDefective = newSamples.reduce((sum, sample) => sum + sample.defective, 0);
    const totalInspected = newSamples.reduce((sum, sample) => sum + sample.inspected, 0);
    const pBar = totalDefective / totalInspected;
    
    // Calculate control limits
    const updatedSamples = newSamples.map(sample => {
      const n = sample.inspected;
      const ucl = pBar + 3 * Math.sqrt((pBar * (1 - pBar)) / n);
      const lcl = Math.max(0, pBar - 3 * Math.sqrt((pBar * (1 - pBar)) / n));
      
      return {
        ...sample,
        ucl,
        lcl,
        cl: pBar
      };
    });
    
    // Check if any samples are out of control
    const outOfControl = updatedSamples.some(sample => 
      sample.proportion > sample.ucl || sample.proportion < sample.lcl
    );
    
    setSamples(updatedSamples);
    setSampleCount(prev => prev + 1);
    setDefective("");
    setInspected("");
    
    setResults({
      pBar,
      cl: pBar,
      ucl: updatedSamples[updatedSamples.length - 1].ucl,
      lcl: updatedSamples[updatedSamples.length - 1].lcl,
      outOfControl
    });
  };
  
  const resetData = () => {
    setSamples([]);
    setSampleCount(1);
    setDefective("");
    setInspected("");
    setResults({
      pBar: 0,
      cl: 0,
      ucl: 0,
      lcl: 0,
      outOfControl: false
    });
  };

  return (
    <Card className="glass-card w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="h-6 w-6 text-neon-blue" />
          <span className="neon-text">P-Chart Calculator</span>
        </CardTitle>
        <CardDescription>
          Enter the number of defective items and inspected items for each sample
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="info">Information & Formulas</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator" className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 my-4">
                <div className="flex flex-col flex-1 space-y-2">
                  <Label htmlFor="defective">Number of Defective Items</Label>
                  <Input
                    id="defective"
                    type="number"
                    min="0"
                    value={defective}
                    onChange={(e) => setDefective(e.target.value)}
                    className="neon-outline"
                    placeholder="e.g., 5"
                  />
                </div>
                <div className="flex flex-col flex-1 space-y-2">
                  <Label htmlFor="inspected">Number of Inspected Items</Label>
                  <Input
                    id="inspected"
                    type="number"
                    min="1"
                    value={inspected}
                    onChange={(e) => setInspected(e.target.value)}
                    className="neon-outline"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Button 
                  onClick={calculatePChart} 
                  className="neon-button"
                  disabled={!defective || !inspected}
                >
                  Calculate
                </Button>
                <Button 
                  onClick={resetData} 
                  variant="outline"
                  className="border-neon-purple text-neon-purple hover:bg-neon-purple/10"
                >
                  Reset Data
                </Button>
              </div>

              {samples.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                      <h3 className="text-lg font-semibold mb-2">Results</h3>
                      <p className="flex justify-between">
                        <span>P-bar (Average proportion):</span>
                        <span className="font-mono">{results.pBar.toFixed(4)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Center Line (CL):</span>
                        <span className="font-mono">{results.cl.toFixed(4)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Upper Control Limit (UCL):</span>
                        <span className="font-mono">{results.ucl.toFixed(4)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Lower Control Limit (LCL):</span>
                        <span className="font-mono">{results.lcl.toFixed(4)}</span>
                      </p>
                    </div>
                    <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                      <h3 className="text-lg font-semibold mb-2">Status</h3>
                      {results.outOfControl ? (
                        <p className="text-red-500">⚠️ Process is out of control! Some points exceed control limits.</p>
                      ) : (
                        <p className="text-green-500">✅ Process is in control. All points within control limits.</p>
                      )}
                      <p className="mt-2 text-sm">Total samples: {samples.length}</p>
                      <p className="text-sm">Last sample proportion: {samples[samples.length - 1].proportion.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="h-[400px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={samples}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="sample" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="proportion" 
                          stroke="#4DEEEA" 
                          activeDot={{ r: 8 }}
                          name="Proportion"
                          strokeWidth={2}
                        />
                        <ReferenceLine y={results.ucl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'UCL', fill: '#F53F7B', position: 'right' }} />
                        <ReferenceLine y={results.cl} stroke="#B643D5" strokeDasharray="3 3" label={{ value: 'CL', fill: '#B643D5', position: 'right' }} />
                        <ReferenceLine y={results.lcl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'LCL', fill: '#F53F7B', position: 'right' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="info" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 neon-text">P-Chart Overview</h3>
                <p>
                  A P-Chart (Proportion Chart) is a type of control chart used to monitor the proportion
                  of nonconforming items in a sample. It's commonly used in quality control processes 
                  to track defects as a proportion or percentage of the total items inspected.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neon-blue/30 rounded-lg bg-black/30">
                  <h4 className="font-semibold mb-2">Formulas Used</h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">P (Proportion) = </span> 
                      <span className="font-mono">Number of Defective Items / Number of Inspected Items</span>
                    </p>
                    <p>
                      <span className="font-semibold">P-bar = </span> 
                      <span className="font-mono">Total Defective Items / Total Inspected Items</span>
                    </p>
                    <p>
                      <span className="font-semibold">CL (Center Line) = </span> 
                      <span className="font-mono">P-bar</span>
                    </p>
                    <p>
                      <span className="font-semibold">UCL = </span> 
                      <span className="font-mono">P-bar + 3 × √(P-bar × (1 - P-bar) / n)</span>
                    </p>
                    <p>
                      <span className="font-semibold">LCL = </span> 
                      <span className="font-mono">P-bar - 3 × √(P-bar × (1 - P-bar) / n)</span>
                      <br/>
                      <span className="text-sm">(If LCL is negative, it's set to 0)</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 border border-neon-purple/30 rounded-lg bg-black/30">
                  <h4 className="font-semibold mb-2">Real-World Applications</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Manufacturing: Monitoring defect rates in production lines</li>
                    <li>Healthcare: Tracking infection rates in hospitals</li>
                    <li>Customer Service: Analyzing complaint percentages</li>
                    <li>Electronics: Quality control for circuit board defects</li>
                    <li>Food Processing: Monitoring contamination rates</li>
                    <li>Retail: Tracking damaged goods percentages</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                <h4 className="font-semibold mb-2">Interpreting Results</h4>
                <p>
                  A process is considered "in control" when all data points fall within the control limits (between LCL and UCL).
                  Points outside these limits suggest special cause variation that should be investigated.
                </p>
                <p className="mt-2">
                  If 8 or more consecutive points fall on one side of the center line, or show consistent patterns 
                  (like trends or cycles), this may also indicate that the process is not in statistical control,
                  even if all points are within the control limits.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default PChart;
