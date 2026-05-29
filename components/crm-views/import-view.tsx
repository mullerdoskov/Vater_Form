"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, Check, AlertCircle, Download, X } from "lucide-react"

export function ImportView() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "processing" | "complete" | "error">("idle")

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      startImport(file.name)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      startImport(file.name)
    }
  }

  const startImport = (filename: string) => {
    setUploadedFile(filename)
    setImportStatus("uploading")
    setImportProgress(0)

    const interval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportStatus("complete")
          return 100
        }
        if (prev >= 30 && importStatus === "uploading") {
          setImportStatus("processing")
        }
        return prev + 10
      })
    }, 300)
  }

  const resetImport = () => {
    setUploadedFile(null)
    setImportProgress(0)
    setImportStatus("idle")
  }

  const recentImports = [
    { name: "contatos_janeiro.csv", date: "15/01/2024", records: 245, status: "success" },
    { name: "leads_marketing.xlsx", date: "12/01/2024", records: 89, status: "success" },
    { name: "clientes_antigos.csv", date: "10/01/2024", records: 567, status: "success" },
    { name: "prospects_q4.csv", date: "08/01/2024", records: 0, status: "error" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Importar Dados</h2>
        <p className="text-slate-500">Importe contatos e leads de arquivos externos</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="col-span-2 space-y-6">
          <Card
            className={`bg-white border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {importStatus === "idle" ? (
              <>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Arraste e solte seu arquivo aqui
                </h3>
                <p className="text-slate-500 mb-4">ou clique para selecionar</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Selecionar Arquivo</span>
                  </Button>
                </label>
                <p className="text-xs text-slate-400 mt-4">Formatos aceitos: CSV, XLSX, XLS (max 10MB)</p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-slate-600" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">{uploadedFile}</p>
                    <p className="text-sm text-slate-500">
                      {importStatus === "uploading" && "Enviando arquivo..."}
                      {importStatus === "processing" && "Processando dados..."}
                      {importStatus === "complete" && "Importacao concluida!"}
                      {importStatus === "error" && "Erro na importacao"}
                    </p>
                  </div>
                </div>

                <Progress value={importProgress} className="h-2" />

                <div className="flex items-center justify-center gap-4">
                  {importStatus === "complete" && (
                    <>
                      <Badge className="bg-green-100 text-green-700">
                        <Check className="h-3 w-3 mr-1" />
                        156 registros importados
                      </Badge>
                      <Button variant="outline" onClick={resetImport}>
                        Nova Importacao
                      </Button>
                    </>
                  )}
                  {(importStatus === "uploading" || importStatus === "processing") && (
                    <Button variant="outline" onClick={resetImport}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Mapping Preview */}
          {importStatus === "complete" && (
            <Card className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Mapeamento de Campos</h3>
              <div className="space-y-3">
                {[
                  { file: "name", system: "Nome", status: "ok" },
                  { file: "email", system: "E-mail", status: "ok" },
                  { file: "phone", system: "Telefone", status: "ok" },
                  { file: "company", system: "Empresa", status: "ok" },
                  { file: "notes", system: "Observacoes", status: "warning" },
                ].map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono bg-slate-200 px-2 py-1 rounded text-slate-600">{field.file}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-sm text-slate-800">{field.system}</span>
                    </div>
                    {field.status === "ok" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Imports */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Importacoes Recentes</h3>
          <div className="space-y-3">
            {recentImports.map((item, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                  {item.status === "success" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.date}</span>
                  <span>{item.records > 0 ? `${item.records} registros` : "Falhou"}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-medium text-slate-800 mb-3">Modelo de Importacao</h4>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Baixar Template CSV
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
