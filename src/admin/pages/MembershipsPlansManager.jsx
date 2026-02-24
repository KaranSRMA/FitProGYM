import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, IndianRupee, Loader } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

const REST_API = import.meta.env.VITE_REST_API;

const fetchPlans = async () => {
  try {
    const { data } = await axios.get(`${REST_API}/plans`, { withCredentials: true });
    return data;
  } catch (err) {
    const message = err.response?.data?.detail || "Failed to fetch plans!"
    throw new Error(message);
  }
}

export function MembershipPlansManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddLoading, setisAddLoading] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    duration: '',
    description: '',
    features: '',
    isPopular: false,
  });

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      price: '',
      duration: '',
      description: '',
      features: '',
      isPopular: false,
    });
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['plans'],
    queryFn: () => fetchPlans(),
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });

  useEffect(() => {
    if (isError) {
      const msg = error?.response?.data?.detail || 'Failed to fetch plans';
      toast.error(msg);
      if (/unauthorized|401/i.test(msg)) {
        navigate('/login', { replace: true });
      }
    }
  }, [isError, error, navigate]);

  const plans = data?.plans;

  const handleAddPlan = async () => {
    if (!formData.name?.trim() || !formData.price || !formData.description?.trim() || !formData.features?.trim() || !formData.duration?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const featuresData = formData.features.split('\n').map(item => item.trim()).filter(item => item !== "");

    try {
      setisAddLoading(true);
      const payload = {
        plan_name: formData.name.trim(),
        price: formData.price,
        description: formData.description.trim(),
        popular: formData.isPopular,
        features: featuresData,
        duration: formData.duration
      }

      const { data: resPlan, status } = await axios.post(`${REST_API}/createPlans`, payload, { withCredentials: true });
      if (status === 201) {

        queryClient.invalidateQueries({ queryKey: ['plans'] })
        setisAddLoading(false);
        setIsAddDialogOpen(false);
        resetForm();
        toast.success(resPlan.message);
      } else {
        toast.error("Unexpected response from server")
      }
    } catch (error) {
      let message = "An error occurred. Please try again later!";
      const apiError = error.response?.data?.detail;

      if (typeof apiError === 'string') {
        message = apiError;
      } else if (Array.isArray(apiError)) {
        message = apiError.map(err => err.msg).join(", ");
      }
      toast.error(message);
    }
  }
  const handleEditPlan = async () => {
    if (!formData.name.trim() || !formData.price || !formData.description.trim() || !formData.features || !formData.duration.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setisAddLoading(true);
      const payload = {
        plan_name: formData.name.trim(),
        price: formData.price,
        description: formData.description.trim(),
        popular: formData.isPopular,
        features: formData.features,
        duration: formData.duration
      }
      const { data: resPlanEdit, status } = await axios.put(`${REST_API}/editPlan?id=${formData.id}`, payload, { withCredentials: true });
      if (status === 200) {
        toast.success(resPlanEdit.message)
        queryClient.invalidateQueries({ queryKey: ['plans'] })
        setIsEditDialogOpen(false);
        resetForm();
        setisAddLoading(false);
      } else {
        toast.error("Unexpected response from server")
      }

    } catch (error) {
      toast.error(error.response?.data?.detail || 'Action failed');
    } finally {
      setisAddLoading(false);
    }

  };

  const handleDeletePlan = async (id) => {
    try {
      const { data: resPlanDelete, status } = await axios.delete(`${REST_API}/deletePlan?id=${Number(id)}`, { withCredentials: true });
      if (status === 200) {
        toast.success(resPlanDelete.message);
        queryClient.invalidateQueries({ queryKey: ['plans'] })
      }
      else {
        toast.error("Unexpected response from server")
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Action failed")
      console.log(error.response)
    }
  };

  const openEditDialog = (plan) => {
    setFormData({
      id: plan.id,
      name: plan.plan_name,
      price: plan.price,
      duration: plan.duration,
      description: plan.description,
      features: plan.features,
      isPopular: plan.popular,
    });
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const modalInitialRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
      }
    };
    if (isAddDialogOpen || isEditDialogOpen) {
      document.addEventListener('keydown', onKey);
      setTimeout(() => modalInitialRef.current?.focus(), 0);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [isAddDialogOpen, isEditDialogOpen]);

  return (
    <div className="min-h-screen bg-zinc-950 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-white text-2xl font-bold mb-2">Membership Plans</h1>
              <p className="text-zinc-400">Create and manage membership pricing plans</p>
            </div>
            <button onClick={openAddDialog} className="bg-red-500 cursor-pointer px-3 flex items-center py-2 rounded-xl hover:bg-red-600 text-white">
              <Plus className="size-4 mr-2" />
              Add Plan
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        {isLoading ? (
          <div>
            <div className="py-20 text-center">
              <Loader className="size-8 animate-spin text-red-500 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">Loading Plans...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className={`bg-zinc-900 flex flex-col border p-6 rounded-xl hover:border-zinc-700 transition-colors h-full ${plan.popular ? 'border-red-500/50' : 'border-zinc-800'
                    }`}>
                    <div className="text-center pb-4">
                      <h2 className="text-white text-2xl mb-2">{plan.plan_name}</h2>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-4xl text-white">${plan.price}</span>
                        <span className="text-zinc-400">/{plan.duration}</span>
                      </div>
                      <p className="text-zinc-400">{plan.description}</p>
                    </div>
                    <div className='flex flex-1 flex-col'>
                      <div className="space-y-3 flex-1 mb-6 mt-6">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="size-5 text-red-500 shrink-0 mt-0.5" />
                            <span className="text-zinc-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className='text-white text-xs mb-2 flex gap-1 items-center justify-between px-2'>
                        <p>Created: {new Date(plan.created_at).toLocaleDateString()}</p>
                        <p>Updated: {new Date(plan.updated_at).toLocaleDateString()}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditDialog(plan)}
                          size="sm"
                          className="flex-1 border cursor-pointer flex items-center justify-center gap-5 py-2 bg-zinc-800 rounded-lg border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        >
                          <Edit2 className="size-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          size="sm"
                          className="border-red-500/30 text-red-500 border cursor-pointer px-3 rounded-lg hover:bg-red-500/10"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {plans?.length === 0 && !isLoading(
          <div className="text-center py-12">
            <p className="text-zinc-400">No membership plans available</p>
          </div>
        )}

        {/* Add/Edit Plan Modal (internal, no shadcn dependency) */}
        <AnimatePresence>
          {(isAddDialogOpen || isEditDialogOpen) && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black/60"
                onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}
              />

              {/* Modal content */}
              <motion.div
                className="relative z-10 bg-zinc-900 border border-zinc-800 text-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
                role="dialog"
                aria-modal="true"
                aria-label={isEditDialogOpen ? 'Edit Membership Plan' : 'Add New Membership Plan'}
                initial={{ y: 20, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 10, opacity: 0, scale: 0.98 }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{isEditDialogOpen ? 'Edit Membership Plan' : 'Add New Membership Plan'}</h3>
                  <p className="text-zinc-400 text-sm">{isEditDialogOpen ? 'Update plan details below' : 'Fill in the plan details below'}</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='flex flex-col gap-1'>
                      <label htmlFor="name" className="text-zinc-300">Plan Name</label>
                      <input
                        id="name"
                        ref={modalInitialRef}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-zinc-800 border rounded-lg py-1.5 px-2 border-zinc-700 text-white"
                        placeholder="Basic"
                      />
                    </div>
                    <div className='flex flex-col gap-1'>
                      <label htmlFor="duration" className="text-zinc-300">Duration</label>
                      <input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="bg-zinc-800 border rounded-lg py-1.5 px-2 border-zinc-700 text-white"
                        placeholder="Basic"
                      />
                    </div>
                    <div className='flex flex-col gap-1'>
                      <label htmlFor="price" className="text-zinc-300">Price</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                        <input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="bg-zinc-800 border w-full py-1.5 px-2 rounded-lg border-zinc-700 text-white pl-9"
                          placeholder="29"
                        />
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="description" className="text-zinc-300">Description</label>
                    <input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-zinc-800 border py-1.5 px-2 rounded-lg border-zinc-700 text-white"
                      placeholder="Perfect for beginners"
                    />
                  </div>

                  <div className='flex flex-col gap-1'>
                    <label htmlFor="features" className="text-zinc-300">Features (one per line)</label>
                    <textarea
                      id="features"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      className="bg-zinc-800 border px-2 py-1.5 border-zinc-700 rounded-lg text-white resize-none"
                      placeholder={`Access to gym facilities${"\n"}Locker room access${"\n"}Free WiFi`}
                      rows={8}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="size-4 rounded border-zinc-700 bg-zinc-800 text-red-500 focus:ring-red-500"
                    />
                    <label htmlFor="isPopular" className="text-zinc-300">Mark as most popular</label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setIsEditDialogOpen(false);
                    }}
                    className="border-zinc-700 border bg-zinc-800 hover:bg-zinc-700 cursor-pointer text-zinc-300 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isEditDialogOpen ? handleEditPlan : handleAddPlan}
                    className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    {isAddLoading ? (
                      <Loader className="size-8 animate-spin text-white mx-auto mb-2" />
                    ) : (
                      isEditDialogOpen ? 'Save Changes' : 'Add Plan'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
