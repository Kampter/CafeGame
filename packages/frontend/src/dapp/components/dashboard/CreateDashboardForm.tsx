import { Button } from '@radix-ui/themes'
import { ChangeEvent, FC, FormEvent, useState } from 'react'
import { useCreateDashboardMutation } from '~~/dapp/hooks/useDashboardMutations'
import type { CreateDashboardFormProps } from '~~/dapp/types/dashboard.types';
import { Input } from '~~/components/ui/Input';

const CreateDashboardForm: FC<CreateDashboardFormProps> = ({ onSuccess }) => {
  const [serviceName, setServiceName] = useState<string>('')
  const { createDashboard } = useCreateDashboardMutation({
    onSuccess: () => {
      setServiceName('') 
      onSuccess?.()
    },
  })

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServiceName(e.target.value)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!serviceName.trim()) {
      alert('Service Name cannot be empty'); 
      return
    }
    createDashboard(serviceName.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 rounded bg-gray-1 p-6 shadow w-full max-w-sm">
      <h2 className="text-xl font-semibold text-gray-12">Create New Dashboard</h2>
      <Input
        placeholder="Enter Service Name (e.g., Arcade)"
        value={serviceName}
        onChange={handleNameChange}
        required
        name="serviceName"
        className="w-full"
      />
      <Button 
        variant="solid" 
        size="3" 
        type="submit" 
        disabled={!serviceName.trim()} 
        className="w-full max-w-xs"
      >
        Create Dashboard
      </Button>
    </form>
  )
}

export default CreateDashboardForm 