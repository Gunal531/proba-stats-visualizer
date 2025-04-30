
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { ChartLine, Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface XBarDataPoint {
  sample: number;
  value: number;
}

interface XBarChartData {
  sampleNumber: number;
  mean: number;
  values: number[];
  ucl: number;
  lcl: number;
  cl: number;
}

const XBarChart = () => {
  const [sampleValues, setSampleValues] = useState<string>("");
  const [samples, setSamples] = useState<XBarChartData[]>([]);
  const [sampleCount, setSampleCount] = useState<number>(1);
  const [results, setResults] = useState({
    xBarBar: 0, // Grand mean
    cl: 0,
    ucl: 0,
    lcl: 0,
    outOfControl: false,
  });
  
  // Control chart constants based on sample size
  const controlConstants: {[key: number]: {A2: number, D3: number, D4: number}} = {
    2: { A2: 1.880, D3: 0, D4: 3.267 },
    3: { A2: 1.023, D3: 0, D4: 2.574 },
    4: { A2: 0.729, D3: 0, D4: 2.282 },
    5: { A2: 0.577, D3: 0, D4: 2.114 },
    6: { A2: 0.483, D3: 0, D4: 2.004 },
    7: { A2: 0.419, D3: 0.076, D4: 1.924 },
    8: { A2: 0.373, D3: 0.136, D4: 1.864 },
    9: { A2: 0.337, D3: 0.184, D4: 1.816 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777 }
  };

  const calculateXBarChart = () => {
    if (!sampleValues.trim()) {
      return;
    }
    
    // Parse input values
    const values = sampleValues
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value !== "")
      .map((value) => Number(value));
      
    if (values.length === 0 || values.some(isNaN)) {
      return;
    }
    
    // Calculate mean for this sample
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Add new sample
    const newSample: XBarChartData = {
      sampleNumber: sampleCount,
      mean,
      values,
      ucl: 0, // Will be calculated after we update samples
      lcl: 0, // Will be calculated after we update samples
      cl: 0,  // Will be calculated after we update samples
    };
    
    const newSamples = [...samples, newSample];
    
    // Calculate xBarBar (grand mean)
    const xBarBar = newSamples.reduce((sum, sample) => sum + sample.mean, 0) / newSamples.length;

    // Calculate standard deviation of sample means
    const stdDev = Math.sqrt(
      newSamples.reduce((sum, sample) => {
        return sum + Math.pow(sample.mean - xBarBar, 2);
      }, 0) / (newSamples.length > 1 ? newSamples.length - 1 : 1)
    );
    
    // Get sample size
    const sampleSize = values.length;
    
    // Use appropriate control limits based on sample size and stdDev
    // For this simplified version, we're using 3-sigma limits
    const ucl = xBarBar + 3 * (stdDev / Math.sqrt(sampleSize));
    const lcl = xBarBar - 3 * (stdDev / Math.sqrt(sampleSize));
    
    // Calculate control limits
    const updatedSamples = newSamples.map((sample) => {
      return {
        ...sample,
        ucl,
        lcl,
        cl: xBarBar,
      };
    });
    
    // Check if any samples are out of control
    const outOfControl = updatedSamples.some(
      (sample) => sample.mean > sample.ucl || sample.mean < sample.lcl
    );
    
    setSamples(updatedSamples);
    setSampleCount((prev) => prev + 1);
    setSampleValues("");
    
    setResults({
      xBarBar,
      cl: xBarBar,
      ucl,
      lcl,
      outOfControl,
    });
  };
  
  const resetData = () => {
    setSamples([]);
    setSampleCount(1);
    setSampleValues("");
    setResults({
      xBarBar: 0,
      cl: 0,
      ucl: 0,
      lcl: 0,
      outOfControl: false,
    });
  };

  // Transform samples for chart display
  const chartData = samples.map((sample) => ({
    sample: sample.sampleNumber,
    mean: sample.mean,
    ucl: sample.ucl,
    lcl: sample.lcl,
    cl: sample.cl,
  }));

  return (
    <Card className="glass-card w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ChartLine className="h-6 w-6 text-neon-blue" />
          <span className="neon-text">X-Bar Chart Calculator</span>
        </CardTitle>
        <CardDescription>
          Enter the sample values separated by commas (e.g., 10, 15, 20)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="results">Chart</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator" className="space-y-6">
              <div className="flex flex-col space-y-2 my-4">
                <Label htmlFor="sampleValues">Sample Values</Label>
                <Input
                  id="sampleValues"
                  value={sampleValues}
                  onChange={(e) => setSampleValues(e.target.value)}
                  className="neon-outline"
                  placeholder="e.g., 10, 15, 20, 25"
                />
                <p className="text-xs text-muted-foreground">
                  Enter values separated by commas
                </p>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Button 
                  onClick={calculateXBarChart} 
                  className="neon-button"
                  disabled={!sampleValues.trim()}
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
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="border-neon-pink text-neon-pink bg-black/60 border hover:bg-neon-pink/10 shadow-[0_0_5px_theme(colors.neon.pink)]">
                      <Calculator className="mr-2 h-4 w-4" /> Control Constants
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-neon-blue">
                    <DialogHeader>
                      <DialogTitle className="neon-text">Control Chart Constants</DialogTitle>
                      <DialogDescription>
                        Constants used for calculating control limits based on sample size
                      </DialogDescription>
                    </DialogHeader>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="py-2 px-2 text-left">Sample Size</th>
                            <th className="py-2 px-2 text-left">A2</th>
                            <th className="py-2 px-2 text-left">D3</th>
                            <th className="py-2 px-2 text-left">D4</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(controlConstants).map(([size, constants]) => (
                            <tr key={size} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-1.5 px-2">{size}</td>
                              <td className="py-1.5 px-2">{constants.A2}</td>
                              <td className="py-1.5 px-2">{constants.D3}</td>
                              <td className="py-1.5 px-2">{constants.D4}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-xs mt-4">
                      <p><span className="font-bold text-neon-blue">A2:</span> Factor for calculating X-Bar control limits using R-Bar</p>
                      <p><span className="font-bold text-neon-blue">D3:</span> Factor for calculating R chart lower control limit</p>
                      <p><span className="font-bold text-neon-blue">D4:</span> Factor for calculating R chart upper control limit</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {samples.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div className="overflow-x-auto border border-white/10 rounded-lg">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-black/40 border-b border-white/20">
                          <th className="py-2 px-4 text-left">Sample</th>
                          <th className="py-2 px-4 text-left">Values</th>
                          <th className="py-2 px-4 text-left">Mean</th>
                        </tr>
                      </thead>
                      <tbody>
                        {samples.map((sample) => (
                          <tr key={sample.sampleNumber} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-4">{sample.sampleNumber}</td>
                            <td className="py-2 px-4 font-mono">
                              {sample.values.join(", ")}
                            </td>
                            <td className="py-2 px-4 font-mono">{sample.mean.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                      <h3 className="text-lg font-semibold mb-2">Results</h3>
                      <p className="flex justify-between">
                        <span>X̄-bar (Grand Mean):</span>
                        <span className="font-mono">{results.xBarBar.toFixed(4)}</span>
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
                      <p className="text-sm">Last sample mean: {samples[samples.length - 1].mean.toFixed(4)}</p>
                      <p className="mt-2 text-sm">
                        <span className="font-semibold">Formula: </span>
                        <span>UCL/LCL = X̄-bar ± 3σ/√n</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="results" className="space-y-4">
              {samples.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-[400px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
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
                          dataKey="mean"
                          stroke="#4DEEEA"
                          activeDot={{ r: 8 }}
                          name="Mean"
                          strokeWidth={2}
                        />
                        <ReferenceLine y={results.ucl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'UCL', fill: '#F53F7B', position: 'right' }} />
                        <ReferenceLine y={results.cl} stroke="#B643D5" strokeDasharray="3 3" label={{ value: 'CL', fill: '#B643D5', position: 'right' }} />
                        <ReferenceLine y={results.lcl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'LCL', fill: '#F53F7B', position: 'right' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                    <h3 className="text-lg font-semibold mb-2">Chart Interpretation</h3>
                    <p>
                      The X-Bar chart plots the mean of each sample over time. Points that fall outside the control
                      limits (UCL or LCL) indicate that the process may be influenced by special cause variation
                      and require investigation.
                    </p>
                    <div className={`mt-3 p-2 text-sm rounded-md ${results.outOfControl ? 'bg-red-500/20 border border-red-500/40' : 'bg-green-500/20 border border-green-500/40'}`}>
                      {results.outOfControl ? (
                        <p>⚠️ Process is out of control! Some points exceed control limits.</p>
                      ) : (
                        <p>✅ Process is in control. All points within control limits.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg text-gray-400">No data available. Add samples to view chart.</p>
                  <p className="text-sm text-gray-500 mt-2">Go to Calculator tab to add sample data</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="info" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 neon-text">X-Bar Chart Overview</h3>
                <p>
                  An X-Bar chart is a control chart used to monitor the mean of a process based on samples taken
                  from the process at given times. The X-Bar chart shows how a process changes over time, and is used
                  to determine if a process is stable and predictable.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neon-blue/30 rounded-lg bg-black/30">
                  <h4 className="font-semibold mb-2">Formulas Used</h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">X̄ (Sample Mean) = </span> 
                      <span className="font-mono">Sum of values / Number of values</span>
                    </p>
                    <p>
                      <span className="font-semibold">X̄-bar (Grand Mean) = </span> 
                      <span className="font-mono">Sum of sample means / Number of samples</span>
                    </p>
                    <p>
                      <span className="font-semibold">CL (Center Line) = </span> 
                      <span className="font-mono">X̄-bar</span>
                    </p>
                    <p>
                      <span className="font-semibold">UCL = </span> 
                      <span className="font-mono">X̄-bar + 3σ/√n</span>
                    </p>
                    <p>
                      <span className="font-semibold">LCL = </span> 
                      <span className="font-mono">X̄-bar - 3σ/√n</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Where σ is the standard deviation and n is the sample size
                    </p>
                  </div>
                </div>
                <div className="p-4 border border-neon-purple/30 rounded-lg bg-black/30">
                  <h4 className="font-semibold mb-2">Real-World Applications</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Manufacturing: Monitoring dimensions of machined parts</li>
                    <li>Food Production: Checking weight consistency of packaged products</li>
                    <li>Pharmaceuticals: Ensuring consistent medication dosages</li>
                    <li>Chemical Processing: Monitoring solution concentrations</li>
                    <li>Electronics: Testing voltage outputs in circuit boards</li>
                    <li>Service Industries: Tracking customer waiting times</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                <h4 className="font-semibold mb-2">Control Chart Constants</h4>
                <p>
                  Control chart constants (A2, D3, D4) are mathematically derived factors used in calculating
                  control limits. Their values depend on the subgroup sample size (n).
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Common usage:</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                  <li>A2: Used for computing control limits for the X-bar chart based on R</li>
                  <li>D3: Used for computing the lower control limit for the R chart</li>
                  <li>D4: Used for computing the upper control limit for the R chart</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the "Control Constants" button to view a table of values for different sample sizes.
                </p>
              </div>
              <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                <h4 className="font-semibold mb-2">Interpreting Results</h4>
                <p>
                  The X-Bar chart helps identify if variations in process means are due to common causes 
                  (natural process variation) or special causes (assignable causes that should be identified and eliminated).
                </p>
                <p className="mt-2">
                  A process is considered stable when all sample means fall within the control limits and do not display
                  non-random patterns (like trends, cycles, or shifts). Points outside the control limits or non-random patterns
                  indicate that the process may need investigation and adjustment.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default XBarChart;
