// ... önceki importlar aynı

export default function PolicyList({ policies, customers, vehicles, onDelete }: Props) {
  // ... önceki fonksiyonlar aynı

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Poliçe No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Müşteri
                </th>
                <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Araç
                </th>
                <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Tarih
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Tür
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  Tutar
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sm:px-6">
                    {policy.policyNumber}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                    {getCustomerName(policy.customerId)}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                    {getVehicleInfo(policy.vehicleId)}
                  </td>
                  <td className="hidden sm:table-cell px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                    {new Date(policy.startDate).toLocaleDateString('tr-TR')} -
                    {new Date(policy.endDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                    {policy.type === 'traffic' ? 'Trafik' : 'Kasko'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 sm:px-6">
                    {policy.price.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium sm:px-6">
                    <button
                      onClick={() => onDelete(policy.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}