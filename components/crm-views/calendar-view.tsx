"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from "lucide-react"

type Event = {
  id: number
  title: string
  time: string
  type: "reuniao" | "ligacao" | "tarefa" | "lembrete"
  participants?: string[]
  location?: string
}

type DayEvents = {
  [key: number]: Event[]
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())

  const events: DayEvents = {
    5: [{ id: 1, title: "Reuniao de Vendas", time: "09:00", type: "reuniao", participants: ["Ana", "Bruno"] }],
    8: [
      { id: 2, title: "Ligacao com Cliente", time: "14:00", type: "ligacao" },
      { id: 3, title: "Revisar Proposta", time: "16:00", type: "tarefa" },
    ],
    12: [{ id: 4, title: "Apresentacao Q2", time: "10:00", type: "reuniao", location: "Sala 3", participants: ["Equipe"] }],
    15: [
      { id: 5, title: "Follow-up TechCorp", time: "11:00", type: "ligacao" },
      { id: 6, title: "Almoço com Parceiro", time: "12:30", type: "reuniao", location: "Restaurante Central" },
      { id: 7, title: "Enviar Contrato", time: "15:00", type: "tarefa" },
    ],
    18: [{ id: 8, title: "Demo do Produto", time: "14:00", type: "reuniao", participants: ["Cliente A", "Vendas"] }],
    22: [{ id: 9, title: "Renovacao Lembrete", time: "09:00", type: "lembrete" }],
    25: [
      { id: 10, title: "Revisao Mensal", time: "10:00", type: "reuniao", participants: ["Gerencia"] },
      { id: 11, title: "Fechar Meta", time: "17:00", type: "tarefa" },
    ],
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDay(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDay(null)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "reuniao": return "bg-blue-100 text-blue-700 border-blue-200"
      case "ligacao": return "bg-green-100 text-green-700 border-green-200"
      case "tarefa": return "bg-amber-100 text-amber-700 border-amber-200"
      case "lembrete": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getEventTypeName = (type: string) => {
    switch (type) {
      case "reuniao": return "Reuniao"
      case "ligacao": return "Ligacao"
      case "tarefa": return "Tarefa"
      case "lembrete": return "Lembrete"
      default: return type
    }
  }

  const selectedDayEvents = selectedDay ? events[selectedDay] || [] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendario</h2>
          <p className="text-slate-500">Gerencie seus compromissos e tarefas</p>
        </div>
        <Button className="bg-slate-800 hover:bg-slate-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const hasEvents = events[day] && events[day].length > 0
              const isSelected = selectedDay === day
              const isToday = day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative ${
                    isSelected
                      ? "bg-slate-800 text-white"
                      : isToday
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-1">
                      {events[day].slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-white" : "bg-blue-500"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Events Panel */}
        <Card className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {selectedDay ? `Dia ${selectedDay}` : "Selecione um dia"}
          </h3>

          {selectedDay ? (
            selectedDayEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDayEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-800">{event.title}</h4>
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {getEventTypeName(event.type)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                      {event.participants && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {event.participants.join(", ")}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>Nenhum evento neste dia</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Evento
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>Clique em um dia para ver os eventos</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
