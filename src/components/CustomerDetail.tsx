import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { User, Car, FileText, Upload, ArrowLeft, Trash2, Edit2, Save, X, FileIcon, MessageSquare, History } from 'lucide-react';
import { db } from '../db';
import { useAuthStore } from '../store/authStore';
import type { Customer, Vehicle, Policy, CustomerDocument, CustomerNote } from '../types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [uploadType, setUploadType] = useState<CustomerDocument['type']>('identity');
  const [documentName, setDocumentName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [showOldNotes, setShowOldNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  
  const customer = useLiveQuery(() => db.customers.get(id!));
  const vehicles = useLiveQuery(() => db.vehicles.where('customerId').equals(id!).toArray()) ?? [];
  const policies = useLiveQuery(() => db.policies.where('customerId').equals(id!).toArray()) ?? [];

  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [editedPolicy, setEditedPolicy] = useState<Policy | null>(null);

  React.useEffect(() => {
    if (customer && !editedCustomer) {
      setEditedCustomer(customer);
    }
  }, [customer]);

  if (!customer || !editedCustomer) return null;

  const getDateStatus = (date: string) => {
    const targetDate = new Date(date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30 && diffDays >= 0) {
      const color = diffDays > 19 ? 'text-orange-600' : 
                   diffDays > 9 ? 'text-yellow-600' : 
                   'text-red-600';
      return {
        isClose: true,
        days: diffDays,
        color
      };
    }
    
    return {
      isClose: false,
      days: diffDays,
      color: 'text-gray-600'
    };
  };

  const handleSaveCustomer = async () => {
    await db.customers.update(id!, editedCustomer);
    setEditMode(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setEditedVehicle(vehicle);
  };

  const handleSaveVehicle = async () => {
    if (editedVehicle) {
      await db.vehicles.update(editedVehicle.id, editedVehicle);
      setEditingVehicleId(null);
      setEditedVehicle(null);
    }
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicyId(policy.id);
    setEditedPolicy(policy);
  };

  const handleSavePolicy = async () => {
    if (editedPolicy) {
      await db.policies.update(editedPolicy.id, editedPolicy);
      setEditingPolicyId(null);
      setEditedPolicy(null);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('Bu aracı silmek istediğinize emin misiniz? İlgili tüm poliçeler de silinecektir.')) {
      const relatedPolicies = await db.policies.where('vehicleId').equals(vehicleId).toArray();
      await Promise.all(relatedPolicies.map(policy => db.policies.delete(policy.id)));
      await db.vehicles.delete(vehicleId);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (confirm('Bu poliçeyi silmek istediğinize emin misiniz?')) {
      await db.policies.delete(policyId);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      const newDocument: CustomerDocument = {
        id: crypto.randomUUID(),
        type: uploadType,
        name: documentName || file.name,
        url: base64String,
        mimeType: file.type,
        uploadDate: new Date().toISOString()
      };

      const documents = customer.documents || [];
      await db.customers.update(customer.id, {
        documents: [...documents, newDocument]
      });
      setDocumentName('');
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Bu belgeyi silmek istediğinize emin misiniz?')) {
      const documents = customer.documents?.filter(doc => doc.id !== documentId) || [];
      await db.customers.update(customer.id, { documents });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const newNoteObj: CustomerNote = {
      id: crypto.randomUUID(),
      content: newNote,
      createdBy: user?.name || user?.email || 'Bilinmiyor',
      userEmail: user?.email || 'Bilinmiyor',
      createdAt: new Date().toISOString()
    };

    const notes = customer.notes || [];
    await db.customers.update(customer.id, {
      notes: [newNoteObj, ...notes]
    });
    setNewNote('');
  };

  const documentTypeLabels: Record<CustomerDocument['type'], string> = {
    'identity': 'Kimlik',
    'vehicle-registration': 'Ruhsat',
    'other': 'Diğer'
  };

  const currentNotes = customer.notes?.slice(0, 3) || [];
  const oldNotes = customer.notes?.slice(3) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Geri
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Müşteri Detayları</h1>
        <div className="w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kişisel Bilgiler */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Kişisel Bilgiler
            </h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveCustomer}
                  className="text-green-600 hover:text-green-800"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditedCustomer(customer);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {editMode ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Müşteri Tipi</label>
                <select
                  value={editedCustomer.type || 'individual'}
                  onChange={(e) => setEditedCustomer({...editedCustomer, type: e.target.value as 'individual' | 'corporate'})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="individual">Bireysel</option>
                  <option value="corporate">Kurumsal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad</label>
                <input
                  type="text"
                  value={editedCustomer.firstName}
                  onChange={(e) => setEditedCustomer({...editedCustomer, firstName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soyad</label>
                <input
                  type="text"
                  value={editedCustomer.lastName}
                  onChange={(e) => setEditedCustomer({...editedCustomer, lastName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
                <input
                  type="text"
                  value={editedCustomer.identityNumber}
                  onChange={(e) => setEditedCustomer({...editedCustomer, identityNumber: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  value={editedCustomer.phone}
                  onChange={(e) => setEditedCustomer({...editedCustomer, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p><span className="font-medium">Müşteri Tipi:</span> {editedCustomer.type === 'individual' ? 'Bireysel' : 'Kurumsal'}</p>
              <p><span className="font-medium">Ad:</span> {customer.firstName}</p>
              <p><span className="font-medium">Soyad:</span> {customer.lastName}</p>
              <p><span className="font-medium">TC Kimlik No:</span> {customer.identityNumber}</p>
              <p><span className="font-medium">Telefon:</span> {customer.phone}</p>
            </div>
          )}

          {/* Notlar Bölümü */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Notlar
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Yeni not ekle..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>

              {currentNotes.map(note => (
                <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-gray-800">{note.content}</p>
                  <div className="mt-2 text-sm text-gray-500 flex justify-between">
                    <span>{note.createdBy}</span>
                    <span>{new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              ))}

              {oldNotes.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowOldNotes(!showOldNotes)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <History className="w-4 h-4 mr-1" />
                    Eski Notlar ({oldNotes.length})
                  </button>

                  {showOldNotes && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Eski Notlar</h3>
                          <button
                            onClick={() => setShowOldNotes(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          {oldNotes.map(note => (
                            <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-gray-800">{note.content}</p>
                              <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                <span>{note.createdBy}</span>
                                <span>{new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Araçlar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-blue-600" />
            Araçlar
          </h2>
          <div className="space-y-4">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="p-4 bg-gray-50 rounded-md">
                {editingVehicleId === vehicle.id && editedVehicle ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plaka</label>
                      <input
                        type="text"
                        value={editedVehicle.plate}
                        onChange={(e) => setEditedVehicle({...editedVehicle, plate: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Marka</label>
                        <input
                          type="text"
                          value={editedVehicle.brand}
                          onChange={(e) => setEditedVehicle({...editedVehicle, brand: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Model</label>
                        <input
                          type="text"
                          value={editedVehicle.model}
                          onChange={(e) => setEditedVehicle({...editedVehicle, model: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Yıl</label>
                        <input
                          type="number"
                          value={editedVehicle.year}
                          onChange={(e) => setEditedVehicle({...editedVehicle, year: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Muayene Tarihi</label>
                        <input
                          type="date"
                          value={editedVehicle.inspectionDate || ''}
                          onChange={(e) => setEditedVehicle({...editedVehicle, inspectionDate: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Şasi No</label>
                      <input
                        type="text"
                        value={editedVehicle.chassisNumber}
                        onChange={(e) => setEditedVehicle({...editedVehicle, chassisNumber: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={handleSaveVehicle}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingVehicleId(null);
                          setEditedVehicle(null);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{vehicle.plate}</p>
                      <p className="text-sm text-gray-600">
                        {vehicle.brand} {vehicle.model} - {vehicle.year}
                      </p>
                      <p className="text-sm text-gray-600">
                        Şasi No: {vehicle.chassisNumber}
                      </p>
                      {vehicle.inspectionDate && (
                        <p className={`text-sm ${getDateStatus(vehicle.inspectionDate).color}`}>
                          Muayene: {new Date(vehicle.inspectionDate).toLocaleDateString('tr-TR')}
                          {getDateStatus(vehicle.inspectionDate).isClose && 
                            ` (${getDateStatus(vehicle.inspectionDate).days} gün kaldı)`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Poliçeler */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            Poliçeler
          </h2>
          <div className="space-y-4">
            {policies.map(policy => {
              const vehicle = vehicles.find(v => v.id === policy.vehicleId);
              return (
                <div key={policy.id} className="p-4 bg-gray-50 rounded-md">
                  {editingPolicyId === policy.id && editedPolicy ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Poliçe No</label>
                        <input
                          type="text"
                          value={editedPolicy.policyNumber}
                          onChange={(e) => setEditedPolicy({...editedPolicy, policyNumber: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
                          <input
                            type="date"
                            value={editedPolicy.startDate}
                            onChange={(e) => setEditedPolicy({...editedPolicy, startDate: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
                          <input
                            type="date"
                            value={editedPolicy.endDate}
                            onChange={(e) => setEditedPolicy({...editedPolicy, endDate: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Poliçe Türü</label>
                          <select
                            value={editedPolicy.type}
                            onChange={(e) => setEditedPolicy({...editedPolicy, type: e.target.value as 'traffic' | 'comprehensive'})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="traffic">Trafik Sigortası</option>
                            <option value="comprehensive">Kasko</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tutar (TL)</label>
                          <input
                            type="number"
                            value={editedPolicy.price}
                            onChange={(e) => setEditedPolicy({...editedPolicy, price: Number(e.target.value)})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={handleSavePolicy}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPolicyId(null);
                            setEditedPolicy(null);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Poliçe No: {policy.policyNumber}</p>
                        <p className="text-sm text-gray-600">
                          {vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Bilinmiyor'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {policy.type === 'traffic' ? 'Trafik Sigortası' : 'Kasko'}
                        </p>
                        <p className={`text-sm ${getDateStatus(policy.endDate).color}`}>
                          {new Date(policy.startDate).toLocaleDateString('tr-TR')} -
                          {new Date(policy.endDate).toLocaleDateString('tr-TR')}
                          {getDateStatus(policy.endDate).isClose && 
                            ` (${getDateStatus(policy.endDate).days} gün kaldı)`}
                        </p>
                        <p className="font-medium mt-1">{policy.price.toLocaleString('tr-TR')} TL</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPolicy(policy)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dökümanlar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            Dökümanlar
          </h2>
          
          <div className="flex gap-2 mb-4">
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as CustomerDocument['type'])}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="identity">Kimlik</option>
              <option value="vehicle-registration">Ruhsat</option>
              <option value="other">Diğer</option>
            </select>
            
            <input
              type="text"
              placeholder="Belge Adı (Opsiyonel)"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            
            <label className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Döküman Yükle
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-3">
            {customer.documents?.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500"> {documentTypeLabels[doc.type]} - {new Date(doc.uploadDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Görüntüle
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}