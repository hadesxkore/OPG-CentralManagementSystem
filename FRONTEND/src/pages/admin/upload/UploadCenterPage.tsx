import { useState } from 'react';
import { CloudUpload, FileText, CheckCircle, Clock, Trash2, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const uploadHistory = [
  { id: 1, file: 'Appropriation_FY2025_Q1.xlsx', type: 'Appropriation', uploadedBy: 'Maria Santos', date: '2025-01-05', status: 'Processed', records: 8 },
  { id: 2, file: 'Obligations_Jan2025.xlsx', type: 'Obligations', uploadedBy: 'Maria Santos', date: '2025-02-01', status: 'Processed', records: 12 },
  { id: 3, file: 'Utilization_Q1_2025.xlsx', type: 'Utilization', uploadedBy: 'Maria Santos', date: '2025-03-10', status: 'Processed', records: 8 },
];

function DropZone({ label, description, template }: { label: string; description: string; template: string }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); }}
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
        <CloudUpload className={`w-8 h-8 transition-colors ${dragging ? 'text-blue-600' : 'text-blue-400'}`} />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{label}</h3>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <div className="flex gap-3 justify-center">
        <Button size="sm" style={{ background: '#1D4ED8' }} className="text-xs gap-2">
          <CloudUpload className="w-3.5 h-3.5" /> Choose File
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-2">
          <Download className="w-3.5 h-3.5" /> Download Template
        </Button>
      </div>
      <p className="text-xs text-slate-400 mt-3">Supports: .xlsx, .csv · Max 10MB</p>
    </div>
  );
}

export default function UploadCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Center"
        description="Upload Excel or CSV files to update budget data"
        icon={CloudUpload}
      />

      <Tabs defaultValue="appropriation" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="appropriation">Appropriation</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="appropriation">
          <DropZone
            label="Upload Appropriation Data"
            description="Drag and drop your appropriation Excel file here, or click to browse"
            template="appropriation_template.xlsx"
          />
        </TabsContent>
        <TabsContent value="obligations">
          <DropZone
            label="Upload Obligation Records"
            description="Upload OBR records in Excel format. Ensure OBR number and amount columns are present."
            template="obligations_template.xlsx"
          />
        </TabsContent>
        <TabsContent value="utilization">
          <DropZone
            label="Upload Utilization Report"
            description="Upload quarterly utilization data per office"
            template="utilization_template.xlsx"
          />
        </TabsContent>
      </Tabs>

      {/* Upload History */}
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Upload History</CardTitle>
          <CardDescription className="text-xs">Recent data uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uploadHistory.map(h => (
              <div key={h.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{h.file}</p>
                  <p className="text-xs text-slate-400">{h.type} · {h.records} records · Uploaded by {h.uploadedBy}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{h.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">{h.date}</p>
                </div>
                <button className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
