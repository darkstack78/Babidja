'use client';

import { useState } from 'react'
import { Plus, Pencil, Ban, X, Check } from 'lucide-react'
import Avatar from '@/components/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import Input from '@/components/ui/Input'
import { hotelEmployees, carEmployees, employeePermissions, type MockEmployee } from '@/data/mock'

export default function ProEmployees({ type = 'hotel' }: { type?: 'hotel' | 'car' }) {
  const isCar = type === 'car'
  const initialData = isCar ? carEmployees : hotelEmployees

  const [empList, setEmpList] = useState(initialData)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | number | null>(null)

  // Ré-initialise la liste locale (mock) quand le type de fiche change, sans passer par un effect
  // (cf. https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [prevType, setPrevType] = useState(type)
  if (type !== prevType) {
    setPrevType(type)
    setEmpList(initialData)
  }

  // Form states
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [role, setRole] = useState('')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [perms, setPerms] = useState<Record<string, boolean>>(
    Object.fromEntries(employeePermissions.map((p) => [p.id, p.default]))
  )

  const handleOpenModal = (emp: MockEmployee | null = null) => {
    if (emp) {
      setEditingId(emp.id)
      setName(emp.name)
      setContact(emp.handle || '')
      setRole(emp.role || '')
      setLoginId(emp.loginId || '')
      setPassword(emp.password || '')
      setPerms(Object.fromEntries(employeePermissions.map((p) => [p.id, p.default])))
    } else {
      setEditingId(null)
      setName('')
      setContact('')
      setRole('')
      setLoginId('')
      setPassword('')
      setPerms(Object.fromEntries(employeePermissions.map((p) => [p.id, p.default])))
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingId) {
      setEmpList(empList.map((emp) =>
        emp.id === editingId ? { ...emp, name, handle: contact, role: role || 'Employé', loginId, password } : emp
      ))
    } else {
      const newEmp = {
        id: Date.now(),
        name,
        handle: contact,
        role: role || 'Employé',
        loginId,
        password,
        status: 'Actif',
        added: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      }
      setEmpList([newEmp, ...empList])
    }
    setShowModal(false)
  }

  const toggleStatus = (id: string | number) => {
    setEmpList(empList.map((emp) =>
      emp.id === id ? { ...emp, status: emp.status === 'Actif' ? 'Inactif' : 'Actif' } : emp
    ))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Gérer les employés</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="size-4" /> Ajouter un employé
        </Button>
      </div>

      <section className="mt-4 overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
        <table className="w-full min-w-2xl text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="py-2 font-semibold">Employé</th>
              <th className="py-2 font-semibold">Rôle/Permissions</th>
              <th className="py-2 font-semibold">Statut</th>
              <th className="py-2 font-semibold">Date d’ajout</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {empList.map((e) => (
              <tr key={e.id} className="border-b border-gray-50">
                <td className="py-3">
                  <span className="flex items-center gap-2.5">
                    <Avatar name={e.name} size="sm" />
                    <span>
                      <span className="block font-medium">{e.name}</span>
                      <span className="text-xs text-gray-500">{e.handle}</span>
                    </span>
                  </span>
                </td>
                <td className="py-3">{e.role}</td>
                <td className="py-3">
                  <Badge variant={e.status === 'Actif' ? 'success' : 'neutral'}>{e.status}</Badge>
                </td>
                <td className="py-3 text-gray-500">{e.added}</td>
                <td className="py-3">
                  <span className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleOpenModal(e)}>
                      <Pencil className="size-3.5" /> Modifier
                    </Button>
                    <Button 
                      variant={e.status === 'Actif' ? 'danger' : 'secondary'} 
                      size="sm" 
                      onClick={() => toggleStatus(e.id)}
                    >
                      {e.status === 'Actif' ? (
                        <><Ban className="size-3.5" /> Désactiver</>
                      ) : (
                        <><Check className="size-3.5" /> Activer</>
                      )}
                    </Button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal d'ajout / modification */}
      {showModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{editingId ? 'Modifier l\'employé' : 'Ajouter un employé'}</h2>
              <button aria-label="Fermer" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-ink">
                <X className="size-5" />
              </button>
            </div>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Nom" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input 
                  placeholder="Contact (e-mail/tél)" 
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
              <Input 
                placeholder="Rôle (ex: Réceptionniste)" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="ID de connexion" 
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                />
                <Input 
                  type="password"
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="mt-1 flex flex-col gap-2.5">
                <p className="text-sm font-semibold mt-2">Permissions :</p>
                {employeePermissions.map((p) => (
                  <Checkbox
                    key={p.id}
                    label={p.label}
                    checked={perms[p.id]}
                    onChange={(v) => setPerms((s) => ({ ...s, [p.id]: v }))}
                  />
                ))}
              </div>
              <Button className="mt-4 w-full" type="submit">
                {editingId ? 'Enregistrer les modifications' : 'Ajouter'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
