
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine, 
  ResponsiveContainer 
} from "recharts";
import { ChartLine, Calculator } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SampleData {
  id: number;
  values: number[];
  xBar: number;
  range: number;
}

const XBarRChart = () => {
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [currentSample, setCurrentSample] = useState<string>("");
  const [sampleSize, setSampleSize] = useState<number>(5);
  const [sampleCount, setSampleCount] = useState<number>(1);
  const [results, setResults] = useState({
    xBarBar: 0,
    rBar: 0,
    xUcl: 0,
    xLcl: 0,
    rUcl: 0,
    rLcl: 0,
    outOfControlX: false,
    outOfControlR: false
  });
  
  // Table of control chart constants
  const controlConstants: {[key: number]: {A2: number, D3: number, D4: number}} = {
    2: { A2: 1.880, D3: 0, D4: 3.267 },
    3: { A2: 1.023, D3: 0, D4: 2.574 },
    4: { A2: 0.729, D3: 0, D4: 2.282 },
    5: { A2: 0.577, D3: 0, D4: 2.114 },
    6: { A2: 0.483, D3: 0, D4: 2.004 },
    7: { A2: 0.419, D3: 0.076, D4: 1.924 },
    8: { A2: 0.373, D3: 0.136, D4: 1.864 },
    9: { A2: 0.337, D3: 0.184, D4: 1.816 },
    10: { A2: 0.308, D3: 0.223, D4: 1.777 },
    11: { A2: 0.285, D3: 0.256, D4: 1.744 },
    12: { A2: 0.266, D3: 0.283, D4: 1.717 },
    15: { A2: 0.223, D3: 0.347, D4: 1.653 },
    20: { A2: 0.180, D3: 0.414, D4: 1.586 },
    25: { A2: 0.153, D3: 0.459, D4: 1.541 }
  };

  const handleSampleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value);
    if (!isNaN(size) && size >= 2 && size <= 25) {
      setSampleSize(size);
    }
  };

  const addSample = () => {
    if (!currentSample.trim()) {
      return;
    }
    
    // Parse measurements from comma-separated input
    const values = currentSample
      .split(",")
      .map(val => val.trim())
      .filter(val => val !== "")
      .map(val => parseFloat(val));
      
    if (values.length === 0 || values.some(isNaN)) {
      return;
    }

    // Calculate X-bar (mean) for this sample
    const xBar = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calculate range (max - min)
    const range = Math.max(...values) - Math.min(...values);
    
    // Add new sample
    const newSample: SampleData = {
      id: sampleCount,
      values,
      xBar,
      range
    };
    
    const updatedSamples = [...samples, newSample];
    
    // Calculate overall statistics
    const xBarBar = updatedSamples.reduce((sum, sample) => sum + sample.xBar, 0) / updatedSamples.length;
    const rBar = updatedSamples.reduce((sum, sample) => sum + sample.range, 0) / updatedSamples.length;
    
    // Get control chart constants based on sample size
    let constants = { A2: 0, D3: 0, D4: 0 };
    
    // Find the closest sample size in the constants table
    const availableSizes = Object.keys(controlConstants).map(Number).sort((a, b) => a - b);
    let closestSize = availableSizes[0];
    
    for (const size of availableSizes) {
      if (values.length <= size) {
        closestSize = size;
        break;
      }
    }
    
    constants = controlConstants[closestSize];
    
    // Calculate control limits
    const xUcl = xBarBar + constants.A2 * rBar;
    const xLcl = xBarBar - constants.A2 * rBar;
    const rUcl = constants.D4 * rBar;
    const rLcl = constants.D3 * rBar;
    
    // Check if any points are out of control
    const outOfControlX = updatedSamples.some(sample => 
      sample.xBar > xUcl || sample.xBar < xLcl
    );
    
    const outOfControlR = updatedSamples.some(sample => 
      sample.range > rUcl || sample.range < rLcl
    );
    
    setSamples(updatedSamples);
    setSampleCount(prev => prev + 1);
    setCurrentSample("");
    
    setResults({
      xBarBar,
      rBar,
      xUcl,
      xLcl,
      rUcl,
      rLcl,
      outOfControlX,
      outOfControlR
    });
  };
  
  const resetData = () => {
    setSamples([]);
    setSampleCount(1);
    setCurrentSample("");
    setResults({
      xBarBar: 0,
      rBar: 0,
      xUcl: 0,
      xLcl: 0,
      rUcl: 0,
      rLcl: 0,
      outOfControlX: false,
      outOfControlR: false
    });
  };

  // Transform data for X-Bar chart
  const xBarChartData = samples.map(sample => ({
    sample: sample.id,
    xBar: sample.xBar,
    xUcl: results.xUcl,
    xLcl: results.xLcl,
    cl: results.xBarBar
  }));
  
  // Transform data for R chart
  const rChartData = samples.map(sample => ({
    sample: sample.id,
    range: sample.range,
    rUcl: results.rUcl,
    rLcl: results.rLcl,
    cl: results.rBar
  }));

  return (
    <Card className="glass-card w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ChartLine className="h-6 w-6 text-neon-blue" />
          <span className="neon-text">X-Bar R Chart</span>
        </CardTitle>
        <CardDescription>
          Enter measurements for each sample, separated by commas (e.g., 10.5, 15.2, 12.8)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="results">Charts</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>
            <TabsContent value="calculator" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div>
                  <Label htmlFor="sampleValues">Sample Measurements</Label>
                  <Input
                    id="sampleValues"
                    value={currentSample}
                    onChange={(e) => setCurrentSample(e.target.value)}
                    className="neon-outline mt-1"
                    placeholder="e.g., 10.5, 15.2, 12.8"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter values separated by commas
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="sampleSize">Sample Size</Label>
                  <Input
                    id="sampleSize"
                    type="number"
                    min={2}
                    max={25}
                    value={sampleSize}
                    onChange={handleSampleSizeChange}
                    className="neon-outline mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Values between 2-25 (affects control constants)
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center gap-4">
                <Button 
                  onClick={addSample} 
                  className="neon-button"
                  disabled={!currentSample.trim()}
                >
                  Add Sample
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
                <div className="overflow-x-auto mt-6 border border-white/10 rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-black/40 border-b border-white/20">
                        <th className="py-2 px-4 text-left">Sample</th>
                        <th className="py-2 px-4 text-left">Values</th>
                        <th className="py-2 px-4 text-left">X-Bar</th>
                        <th className="py-2 px-4 text-left">Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samples.map((sample) => (
                        <tr key={sample.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-4">{sample.id}</td>
                          <td className="py-2 px-4 font-mono">
                            {sample.values.join(", ")}
                          </td>
                          <td className="py-2 px-4 font-mono">{sample.xBar.toFixed(4)}</td>
                          <td className="py-2 px-4 font-mono">{sample.range.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {samples.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                    <h3 className="text-lg font-semibold mb-2">X-Bar Results</h3>
                    <p className="flex justify-between">
                      <span>X-Bar-Bar (Grand Mean):</span>
                      <span className="font-mono">{results.xBarBar.toFixed(4)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Center Line (CL):</span>
                      <span className="font-mono">{results.xBarBar.toFixed(4)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Upper Control Limit (UCL):</span>
                      <span className="font-mono">{results.xUcl.toFixed(4)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Lower Control Limit (LCL):</span>
                      <span className="font-mono">{results.xLcl.toFixed(4)}</span>
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">Formula: </span> 
                      <span className="text-sm">UCL = X-Bar-Bar + A2 × R-Bar</span>
                    </p>
                    <p className="text-sm">LCL = X-Bar-Bar - A2 × R-Bar</p>
                  </div>
                  <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                    <h3 className="text-lg font-semibold mb-2">R Chart Results</h3>
                    <p className="flex justify-between">
                      <span>R-Bar (Mean Range):</span>
                      <span className="font-mono">{results.rBar.toFixed(4)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Center Line (CL):</span>
                      <span className="font-mono">{results.rBar.toFixed(4)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Upper Control Limit (UCL):</span>
                      <span className="font-mono">{results.rUcl.toFixed(4)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Lower Control Limit (LCL):</span>
                      <span className="font-mono">{results.rLcl.toFixed(4)}</span>
                    </p>
                    <p className="mt-2">
                      <span className="font-semibold">Formula: </span> 
                      <span className="text-sm">UCL = D4 × R-Bar</span>
                    </p>
                    <p className="text-sm">LCL = D3 × R-Bar</p>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="results" className="space-y-8">
              {samples.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2 text-neon-blue">X-Bar Chart</h3>
                    <div className={`p-2 text-sm rounded-md ${results.outOfControlX ? 'bg-red-500/20 border border-red-500/40' : 'bg-green-500/20 border border-green-500/40'}`}>
                      {results.outOfControlX ? (
                        <p>⚠️ Process average is out of control! Some points exceed control limits.</p>
                      ) : (
                        <p>✅ Process average is in control. All points within control limits.</p>
                      )}
                    </div>
                    <div className="h-[300px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={xBarChartData}
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
                            dataKey="xBar"
                            stroke="#4DEEEA"
                            activeDot={{ r: 8 }}
                            name="X-Bar"
                            strokeWidth={2}
                          />
                          <ReferenceLine y={results.xUcl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'UCL', fill: '#F53F7B', position: 'right' }} />
                          <ReferenceLine y={results.xBarBar} stroke="#B643D5" strokeDasharray="3 3" label={{ value: 'CL', fill: '#B643D5', position: 'right' }} />
                          <ReferenceLine y={results.xLcl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'LCL', fill: '#F53F7B', position: 'right' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold mb-2 text-neon-blue">R Chart</h3>
                    <div className={`p-2 text-sm rounded-md ${results.outOfControlR ? 'bg-red-500/20 border border-red-500/40' : 'bg-green-500/20 border border-green-500/40'}`}>
                      {results.outOfControlR ? (
                        <p>⚠️ Process variation is out of control! Some ranges exceed control limits.</p>
                      ) : (
                        <p>✅ Process variation is in control. All ranges within control limits.</p>
                      )}
                    </div>
                    <div className="h-[300px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={rChartData}
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
                            dataKey="range"
                            stroke="#F53F7B"
                            activeDot={{ r: 8 }}
                            name="Range"
                            strokeWidth={2}
                          />
                          <ReferenceLine y={results.rUcl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'UCL', fill: '#F53F7B', position: 'right' }} />
                          <ReferenceLine y={results.rBar} stroke="#B643D5" strokeDasharray="3 3" label={{ value: 'CL', fill: '#B643D5', position: 'right' }} />
                          <ReferenceLine y={results.rLcl} stroke="#F53F7B" strokeDasharray="5 5" label={{ value: 'LCL', fill: '#F53F7B', position: 'right' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg text-gray-400">No data available. Add samples to view charts.</p>
                  <p className="text-sm text-gray-500 mt-2">Go to Calculator tab to add sample data</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="info" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 neon-text">X-Bar R Chart Overview</h3>
                <p>
                  X-Bar R Charts are a pair of control charts used together to monitor both the process average (X-Bar) 
                  and process variation (R). The combination provides powerful insights into process stability 
                  and capability.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-neon-blue/30 rounded-lg bg-black/30">
                  <h4 className="font-semibold mb-2">Control Chart Constants</h4>
                  <p className="mb-2">These constants are used in calculations:</p>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">A2: </span> 
                      <span className="font-mono">Factor for X-Bar chart limits</span>
                    </p>
                    <p>
                      <span className="font-semibold">D3: </span> 
                      <span className="font-mono">Factor for R chart LCL</span>
                    </p>
                    <p>
                      <span className="font-semibold">D4: </span> 
                      <span className="font-mono">Factor for R chart UCL</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Values depend on subgroup sample size (n)
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border border-neon-purple/30 rounded-lg bg-black/30">
                  <h4 className="font-semibold mb-2">Real-World Applications</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Manufacturing: Dimensional measurements of parts</li>
                    <li>Electronics: Component voltage or resistance testing</li>
                    <li>Food Production: Weight or volume consistency</li>
                    <li>Pharmaceutical: Active ingredient concentration</li>
                    <li>Machining: Tool wear monitoring</li>
                    <li>Chemical Processing: Reaction temperatures</li>
                    <li>Service Industries: Process time measurements</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                <h4 className="font-semibold mb-2">X-Bar R Chart Formulas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-neon-blue mb-1">X-Bar Chart</h5>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">X-Bar (Sample Mean) = </span> 
                      <span className="font-mono">Sum of values / n</span>
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">X-Bar-Bar (Grand Mean) = </span> 
                      <span className="font-mono">Sum of X-Bars / k</span>
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">UCL = </span> 
                      <span className="font-mono">X-Bar-Bar + A2 × R-Bar</span>
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">LCL = </span> 
                      <span className="font-mono">X-Bar-Bar - A2 × R-Bar</span>
                    </p>
                  </div>
                  <div>
                    <h5 className="text-neon-pink mb-1">R Chart</h5>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">R (Range) = </span> 
                      <span className="font-mono">Max - Min</span>
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">R-Bar (Mean Range) = </span> 
                      <span className="font-mono">Sum of Ranges / k</span>
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">UCL = </span> 
                      <span className="font-mono">D4 × R-Bar</span>
                    </p>
                    <p className="mb-1 text-sm">
                      <span className="font-semibold">LCL = </span> 
                      <span className="font-mono">D3 × R-Bar</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Where: n = sample size (measurements per subgroup), k = number of subgroups (samples)
                </p>
              </div>

              <div className="p-4 border border-white/10 rounded-lg bg-black/30">
                <h4 className="font-semibold mb-2">Interpreting Results</h4>
                <p>
                  The X-Bar chart shows shifts in the process average, while the R chart shows
                  changes in process variability. Points outside of control limits indicate special causes
                  of variation that should be identified and eliminated.
                </p>
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Common causes for out-of-control points:</span>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                  <li>Tool wear or equipment degradation</li>
                  <li>Changes in material or component quality</li>
                  <li>Operator changes or training differences</li>
                  <li>Environmental factors (temperature, humidity)</li>
                  <li>Measurement system issues</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default XBarRChart;
