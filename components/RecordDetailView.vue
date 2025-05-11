<template>
  <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden relative">
    <!-- Floating navigation -->
    <div class="fixed right-6 bottom-6 z-50" style="margin-bottom: env(safe-area-inset-bottom, 0);">
      <button 
        @click="scrollToTop"
        class="bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 mb-3 transition-all opacity-90 hover:opacity-100"
        v-show="showScrollToTop"
      >
        <ArrowUp class="h-5 w-5" />
      </button>
      <button 
        type="submit"
        form="dental-record-form" 
        :disabled="isSubmitting"
        class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-all disabled:opacity-60"
      >
        <LoaderCircle v-if="isSubmitting" class="animate-spin h-5 w-5" />
        <Save v-else class="h-5 w-5" />
      </button>
    </div>

    <!-- Header with hero image and title -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
      <!-- Navigation header -->
      <div class="px-6 py-4 flex justify-between items-center">
        <button @click="$emit('back-to-list')" 
                class="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center">
          <ArrowLeft class="h-5 w-5 text-white" />
          <span class="ml-2 text-white font-medium">Back</span>
        </button>
        
        <div class="flex gap-2">
          <span 
            v-for="(section, index) in sections" 
            :key="index"
            :class="[
              'h-2 rounded-full transition-all', 
              activeSectionIndex >= index ? 'bg-white w-8' : 'bg-white/30 w-2'
            ]"
          ></span>
        </div>
      </div>

      <!-- Record title and info -->
      <div class="px-6 pb-6 pt-2">
        <h3 class="text-2xl font-bold text-white flex items-center mb-3">
          <ClipboardEdit class="h-6 w-6 mr-3" />
          {{ isEditing ? `Edit Record: Tooth #${formData.tooth_number}` : `New Record: Tooth #${formData.tooth_number || '...'}` }}
        </h3>
        
        <div class="flex flex-wrap gap-3">
          <div class="bg-white/20 rounded-full px-3 py-1 text-sm text-white font-medium flex items-center">
            <Calendar class="h-4 w-4 mr-2" />
            {{ new Date().toLocaleDateString() }}
          </div>
          <div 
            v-if="formData.status"
            class="rounded-full px-3 py-1 text-sm font-medium flex items-center"
            :class="getStatusBackgroundClass(formData.status)"
          >
            <Activity class="h-4 w-4 mr-2" />
            {{ formatStatus(formData.status) }}
          </div>
        </div>
      </div>
      
      <!-- Navigation pills -->
      <div class="flex overflow-x-auto px-4 pb-4 hide-scrollbar">
        <div class="flex gap-2 mx-auto">
          <button 
            v-for="(section, index) in sections" 
            :key="section.id"
            @click="scrollToSection(section.id)"
            class="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors"
            :class="[
              activeSectionIndex === index 
                ? 'bg-white text-blue-600' 
                : 'bg-white/10 text-white hover:bg-white/20'
            ]"
          >
            <component :is="section.icon" class="h-4 w-4 inline mr-2" />
            {{ section.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main content area -->
    <div class="p-0 relative" ref="contentContainer">
      <!-- Error alert -->
      <div v-if="error" class="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-md flex items-start">
        <AlertCircle class="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
        <p class="text-red-600 dark:text-red-300 text-sm">{{ error }}</p>
      </div>

      <form id="dental-record-form" @submit.prevent="handleSubmit" class="pb-20">
        <!-- Basic Information Section -->
        <section id="basics" ref="basics" class="scroll-mt-6 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center mb-6">
            <div class="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg mr-3">
              <Pill class="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Basic Information</h2>
          </div>

          <div class="space-y-6">
            <!-- Tooth number and status row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label for="detail_tooth_number" class="form-label">Tooth Number*</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Pill class="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    id="detail_tooth_number" 
                    v-model.number="formData.tooth_number" 
                    required
                    :disabled="isEditing"
                    class="form-input pl-10" 
                    placeholder="Enter tooth number"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="detail_record_status" class="form-label">Record Status*</label>
                <div class="mt-1 relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ActivityIcon class="h-5 w-5 text-gray-400" />
                  </div>
                  <select id="detail_record_status" v-model="formData.status" required class="form-input pl-10">
                    <option value="initial">Initial</option>
                    <option value="diagnosis_planned">Diagnosis Planned</option>
                    <option value="treatment_planned">Treatment Planned</option>
                    <option value="undergoing_treatment">Undergoing Treatment</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Condition selection -->
            <div class="form-group">
              <label class="form-label mb-3">Condition*</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label 
                  v-for="condition in predefinedConditions" 
                  :key="condition" 
                  class="condition-card"
                  :class="{'condition-selected': formData.condition === condition}"
                >
                  <input 
                    type="radio" 
                    :value="condition" 
                    v-model="formData.condition"
                    class="sr-only"
                  />
                  <span class="flex items-center p-3">
                    <CheckCircle 
                      v-if="formData.condition === condition" 
                      class="h-4 w-4 mr-2 text-blue-500" 
                    />
                    <Circle 
                      v-else 
                      class="h-4 w-4 mr-2 text-gray-400" 
                    />
                    {{ condition }}
                  </span>
                </label>
                
                <label 
                  class="condition-card"
                  :class="{'condition-selected': formData.condition === 'other'}"
                >
                  <input 
                    type="radio" 
                    value="other" 
                    v-model="formData.condition"
                    class="sr-only"
                  />
                  <span class="flex items-center p-3">
                    <CheckCircle 
                      v-if="formData.condition === 'other'" 
                      class="h-4 w-4 mr-2 text-blue-500" 
                    />
                    <Circle 
                      v-else 
                      class="h-4 w-4 mr-2 text-gray-400" 
                    />
                    Other
                  </span>
                </label>
              </div>

              <div v-if="formData.condition === 'other'" class="mt-4 animate-fadeIn">
                <div class="form-group">
                  <label for="detail_other_condition" class="form-label">Specify Other Condition*</label>
                  <input 
                    type="text" 
                    id="detail_other_condition" 
                    v-model="formData.other_condition_text" 
                    required
                    placeholder="Describe the condition"
                    class="form-input mt-1" 
                  />
                </div>
              </div>
            </div>

            <!-- General notes -->
            <div class="form-group">
              <label for="detail_record_notes" class="form-label">General Notes</label>
              <textarea 
                id="detail_record_notes" 
                v-model="formData.notes" 
                rows="4"
                placeholder="Add any general notes for this dental record..."
                class="form-input mt-1"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Treatments Section -->
        <section id="treatments" ref="treatments" class="scroll-mt-6 px-6 py-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center">
              <div class="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-lg mr-3">
                <Stethoscope class="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Treatments</h2>
            </div>
            <button 
              type="button" 
              @click="addTreatment"
              class="button-primary-sm flex items-center"
            >
              <PlusCircle class="h-4 w-4 mr-1" />
              Add Treatment
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="!formData.treatments || formData.treatments.length === 0" 
               class="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
            <Stethoscope class="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 class="text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">No treatments added</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Start by adding a new treatment for this record</p>
            <button 
              type="button" 
              @click="addTreatment"
              class="button-primary-sm"
            >
              Add Your First Treatment
            </button>
          </div>

          <!-- Treatment cards -->
          <div v-else class="space-y-6">
            <div v-for="(treatment, treatmentIndex) in formData.treatments" 
                 :key="treatmentIndex"
                 class="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              
              <!-- Treatment card header -->
              <div class="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
                <div class="flex justify-between items-center">
                  <h4 class="text-base font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    <span 
                      class="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-medium mr-2"
                    >
                      {{ treatmentIndex + 1 }}
                    </span>
                    {{ getTreatmentTypeLabel(treatment.treatment_type) || 'New Treatment' }}
                    <span v-if="treatment.cost" class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      (${{ treatment.cost }})
                    </span>
                  </h4>
                  <div class="flex">
                    <button 
                      type="button"
                      @click="treatment._expanded = !treatment._expanded"
                      class="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700/60 mr-1"
                    >
                      <ChevronDown v-if="!treatment._expanded" class="h-4 w-4" />
                      <ChevronUp v-else class="h-4 w-4" />
                    </button>
                    <button 
                      type="button" 
                      @click="removeTreatment(treatmentIndex)"
                      class="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Treatment content -->
              <div v-if="treatment._expanded !== false" class="p-4 space-y-5 animate-fadeIn">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label :for="`detail_treatment_type_${treatmentIndex}`" class="form-label">Treatment Type*</label>
                    <select 
                      :id="`detail_treatment_type_${treatmentIndex}`" 
                      v-model="treatment.treatment_type" 
                      required 
                      class="form-input mt-1"
                    >
                      <option disabled value="">Select treatment</option>
                      <option value="filling">Filling</option>
                      <option value="root_canal">Root Canal</option>
                      <option value="extraction">Extraction</option>
                      <option value="crown">Crown</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="bridge">Bridge</option>
                      <option value="implant">Implant</option>
                      <option value="orthodontics">Orthodontics</option>
                      <option value="other_treatment">Other (Specify)</option>
                    </select>
                  </div>
                  
                  <div class="form-group">
                    <label :for="`detail_treatment_cost_${treatmentIndex}`" class="form-label">Estimated Cost</label>
                    <div class="mt-1 relative">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign class="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="number" 
                        step="0.01" 
                        :id="`detail_treatment_cost_${treatmentIndex}`" 
                        v-model.number="treatment.cost"
                        placeholder="0.00"
                        class="form-input pl-10"
                      />
                    </div>
                  </div>
                  
                  <div class="md:col-span-2">
                    <div class="form-group">
                      <label :for="`detail_treatment_notes_${treatmentIndex}`" class="form-label">Treatment Notes</label>
                      <textarea 
                        :id="`detail_treatment_notes_${treatmentIndex}`" 
                        v-model="treatment.notes" 
                        rows="3"
                        placeholder="Add any notes specific to this treatment..."
                        class="form-input mt-1"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <!-- X-ray section -->
                <div class="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
                  <div class="flex items-center mb-4">
                    <label class="flex items-center cursor-pointer">
                      <input 
                        :id="`detail_xray_taken_${treatmentIndex}`" 
                        type="checkbox" 
                        v-model="treatment.xray_taken"
                        class="sr-only"
                      />
                      <span class="relative w-10 h-6 bg-gray-200 rounded-full transition-colors duration-200 ease-in-out dark:bg-gray-700"
                            :class="{'bg-blue-600 dark:bg-blue-600': treatment.xray_taken}">
                        <span class="absolute left-0 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out transform dark:bg-gray-300"
                              :class="{'translate-x-4': treatment.xray_taken}">
                        </span>
                      </span>
                      <span class="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">X-Ray Image Available</span>
                    </label>
                  </div>
                  
                  <div v-if="treatment.xray_taken" class="mt-2 animate-fadeIn">
                    <div 
                      class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                      @dragover.prevent
                      @drop.prevent="handleFileDrop($event, treatmentIndex)"
                    >
                      <div class="space-y-3 text-center">
                        <Image v-if="!treatment.xray_image_url && !treatment.xray_image_name" class="mx-auto h-12 w-12 text-gray-400" />
                        <div v-else-if="treatment.xray_image_url" class="mx-auto h-24 w-24 relative">
                          <img :src="treatment.xray_image_url" alt="X-ray preview" class="h-full w-full object-cover rounded-lg" />
                          <div class="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <button type="button" @click="removeXrayImage(treatmentIndex)" class="text-white p-1">
                              <Trash2 class="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div class="flex text-sm text-gray-600 dark:text-gray-400">
                          <label :for="`detail_xray_image_input_${treatmentIndex}`" class="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus:ring-offset-gray-900">
                            <span>Upload a file</span>
                            <input :id="`detail_xray_image_input_${treatmentIndex}`" name="xray_image" type="file" @change="handleFileUpload($event, treatmentIndex)" class="sr-only" accept="image/*">
                          </label>
                          <p class="pl-1">or drag and drop</p>
                        </div>
                        
                        <p class="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        <p v-if="treatment.xray_image_name" class="text-sm text-green-600 dark:text-green-400">
                          <CheckCircle2 class="inline-block h-4 w-4 mr-1" />
                          {{ treatment.xray_image_name }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Treatment steps -->
                <div class="mt-4">
                  <div class="flex justify-between items-center mb-4">
                    <h5 class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <ListChecks class="h-4 w-4 mr-2" />
                      Treatment Steps 
                      <span v-if="treatment.steps && treatment.steps.length > 0" 
                            class="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                        {{ treatment.steps.length }}
                      </span>
                    </h5>
                    <button 
                      type="button" 
                      @click="addStep(treatmentIndex)"
                      class="px-2 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50"
                    >
                      <Plus class="h-3 w-3 inline mr-1" />
                      Add Step
                    </button>
                  </div>
                  
                  <div v-if="!treatment.steps || treatment.steps.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-2 px-3 text-center bg-gray-50 dark:bg-gray-900/20 rounded-md border border-dashed border-gray-200 dark:border-gray-700">
                    No steps added for this treatment
                  </div>
                  
                  <!-- Step timeline -->
                  <div v-else class="mt-2 relative">
                    <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    
                    <div 
                      v-for="(step, stepIndex) in treatment.steps" 
                      :key="stepIndex" 
                      class="mb-4 pl-10 relative"
                    >
                      <!-- Timeline dot -->
                      <div :class="[
                        'absolute left-2.5 -translate-x-1/2 h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800',
                        getStepStatusColor(step.status)
                      ]">
                        {{ stepIndex + 1 }}
                      </div>
                      
                      <!-- Step card -->
                      <div class="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                        <div class="flex justify-between items-center mb-2">
                          <div class="flex items-center">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Step {{ stepIndex + 1 }}</span>
                            <span v-if="step.status" 
                                  class="ml-2 px-2 py-0.5 text-xs rounded-full"
                                  :class="getStepStatusBadgeClass(step.status)">
                              {{ formatStepStatus(step.status) }}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            @click="removeStep(treatmentIndex, stepIndex)"
                            class="p-1 rounded-full text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X class="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div class="space-y-3">
                          <div>
                            <input 
                              type="text" 
                              :id="`detail_step_desc_${treatmentIndex}_${stepIndex}`" 
                              v-model="step.description" 
                              required 
                              placeholder="Step description"
                              class="form-input text-sm"
                            >
                          </div>
                          
                          <div class="grid grid-cols-2 gap-3">
                            <div>
                              <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <Calendar class="h-4 w-4 text-gray-400" />
                                </div>
                                <input 
                                  type="date" 
                                  :id="`detail_step_date_${treatmentIndex}_${stepIndex}`" 
                                  v-model="step.step_date"
                                  class="form-input text-sm pl-9"
                                >
                              </div>
                            </div>
                            <div>
                              <select 
                                :id="`detail_step_status_${treatmentIndex}_${stepIndex}`" 
                                v-model="step.status" 
                                required
                                class="form-input text-sm"
                                :class="getStepStatusTextColor(step.status)"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                                <option value="skipped">Skipped</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Summary Section -->
        <section id="summary" ref="summary" class="scroll-mt-6 px-6 py-6">
          <div class="flex items-center mb-6">
            <div class="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg mr-3">
              <CheckCircle2 class="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
          </div>

          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div class="p-6">
                <dl class="grid grid-cols-2 gap-4">
                  <div class="col-span-1">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tooth Number</dt>
                    <dd class="mt-1 text-lg text-gray-900 dark:text-gray-100 font-medium">{{ formData.tooth_number || 'Not specified' }}</dd>
                  </div>
                  
                  <div class="col-span-1">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                    <dd class="mt-1">
                      <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getStatusBadgeClass(formData.status)">
                        {{ formatStatus(formData.status) }}
                      </span>
                    </dd>
                  </div>
                  
                  <div class="col-span-1">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</dt>
                    <dd class="mt-1 text-base text-gray-900 dark:text-gray-100">
                      {{ formData.condition === 'other' ? formData.other_condition_text : formData.condition || 'Not specified' }}
                    </dd>
                  </div>
                  
                  <div class="col-span-2">
                    <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">General Notes</dt>
                    <dd class="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ formData.notes || 'No notes provided' }}</dd>
                  </div>
                </dl>
                
                <div v-if="formData.treatments && formData.treatments.length > 0" class="mt-8">
                  <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText class="h-4 w-4 mr-2" />
                    Treatments Overview
                  </h5>
                  
                  <div class="space-y-2">
                    <div v-for="(treatment, index) in formData.treatments" :key="index" 
                         class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <h6 class="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <span class="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-medium mr-2">
                          {{ index + 1 }}
                        </span>
                        {{ getTreatmentTypeLabel(treatment.treatment_type) }}
                        <span v-if="treatment.cost" class="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          (${{ treatment.cost }})
                        </span>
                      </h6>
                      
                      <p v-if="treatment.notes" class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ treatment.notes }}</p>
                      
                      <div v-if="treatment.steps && treatment.steps.length > 0" class="mt-2 pl-7">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">{{ treatment.steps.length }} steps</p>
                        <div class="flex gap-1">
                          <div v-for="step in treatment.steps" :key="step.description" 
                               class="h-2 w-2 rounded-full"
                               :class="getStepDotColor(step.status)"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Form Actions -->
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="$emit('back-to-list')"
                class="button-secondary"
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                :disabled="isSubmitting"
                class="button-primary"
              >
                <LoaderCircle v-if="isSubmitting" class="animate-spin h-4 w-4 mr-2" />
                {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Record' : 'Save Record') }}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { 
  ClipboardEdit, LoaderCircle, Image, ArrowLeft, ArrowUp, 
  CheckCircle, CheckCircle2, Circle, Trash2, X, Calendar, 
  Plus, PlusCircle, CirclePlus, Pill, AlertCircle, 
  ListChecks, ActivityIcon as Activity, DollarSign, Save,
  ChevronDown, ChevronUp, Stethoscope, FileText
} from 'lucide-vue-next';

const props = defineProps({
  recordDataProp: { 
    type: Object,
    default: null
  },
  patientId: {
    type: [String, Number],
    required: true
  },
  initialToothNumberProp: { 
    type: [String, Number],
    default: null
  },
  isCreatingNew: { 
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'record-saved', 'error', 'back-to-list']);

const config = useRuntimeConfig();
const isEditing = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const showScrollToTop = ref(false);

// Section refs for scrolling
const contentContainer = ref(null);
const basics = ref(null);
const treatments = ref(null);
const summary = ref(null);
const activeSectionIndex = ref(0);

const sections = [
  { 
    id: 'basics', 
    name: 'Basic Info', 
    icon: Pill,
    ref: basics
  },
  { 
    id: 'treatments', 
    name: 'Treatments', 
    icon: Activity,
    ref: treatments
  },
  { 
    id: 'summary', 
    name: 'Summary', 
    icon: CheckCircle2,
    ref: summary
  }
];

const predefinedConditions = ["Healthy", "Decayed", "Filled", "Missing", "Cracked", "Wisdom", "Impacted"];

const defaultStep = () => ({
  description: '',
  step_date: null,
  status: 'pending'
});

const defaultTreatment = () => ({
  treatment_type: '',
  cost: null,
  notes: '',
  xray_taken: false,
  xray_image: null,
  xray_image_name: '',
  xray_image_url: '',
  steps: [],
  _expanded: true // UI state for expanded/collapsed view
});

const initialFormData = () => ({
  tooth_number: props.initialToothNumberProp,
  condition: '',
  other_condition_text: '',
  notes: '',
  status: 'initial',
  treatments: [defaultTreatment()]
});

const formData = ref(initialFormData());

// Scroll handling functions
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const handleScroll = () => {
  showScrollToTop.value = window.scrollY > 300;
  
  // Update active section based on scroll position
  const scrollPosition = window.scrollY + 100;
  
  // Get all section positions
  const sectionPositions = sections.map(section => {
    const el = document.getElementById(section.id);
    return el ? el.offsetTop : 0;
  });
  
  // Find the active section
  for (let i = sectionPositions.length - 1; i >= 0; i--) {
    if (scrollPosition >= sectionPositions[i]) {
      activeSectionIndex.value = i;
      break;
    }
  }
};

const getAccessTokenCookie = () => {
  const token = Cookies.get('dental_access_token');
  if (!token) {
    error.value = 'Authentication token not found. Please log in.';
    emit('error', 'Authentication token not found. Please log in.');
  }
  return token;
};

const handleFileUpload = (event, treatmentIndex) => {
  const file = event.target.files[0];
  const currentTreatment = formData.value.treatments[treatmentIndex];

  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size exceeds 5MB limit.';
      currentTreatment.xray_image = null;
      currentTreatment.xray_image_name = '';
      event.target.value = ''; 
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Invalid file type. Only PNG, JPG, GIF allowed.';
      currentTreatment.xray_image = null;
      currentTreatment.xray_image_name = '';
      event.target.value = ''; 
      return;
    }

    // Create preview URL
    currentTreatment.xray_image_url = URL.createObjectURL(file);
    currentTreatment.xray_image = file;
    currentTreatment.xray_image_name = file.name;
    error.value = null; 
  } else {
    currentTreatment.xray_image = null;
    currentTreatment.xray_image_name = '';
  }
};

const handleFileDrop = (event, treatmentIndex) => {
  const dt = event.dataTransfer;
  const file = dt.files[0];
  
  if (file) {
    handleFileUpload({ target: { files: [file] } }, treatmentIndex);
  }
};

const removeXrayImage = (treatmentIndex) => {
  const currentTreatment = formData.value.treatments[treatmentIndex];
  if (currentTreatment.xray_image_url && currentTreatment.xray_image) {
    URL.revokeObjectURL(currentTreatment.xray_image_url);
  }
  currentTreatment.xray_image = null;
  currentTreatment.xray_image_name = '';
  currentTreatment.xray_image_url = '';
};

const addTreatment = () => {
  if (!formData.value.treatments) {
    formData.value.treatments = [];
  }
  formData.value.treatments.push(defaultTreatment());
  
  // Scroll to treatments section
  nextTick(() => {
    scrollToSection('treatments');
  });
};

const removeTreatment = (treatmentIndex) => {
  formData.value.treatments.splice(treatmentIndex, 1);
};

const addStep = (treatmentIndex) => {
  const treatment = formData.value.treatments[treatmentIndex];
  if (!treatment.steps) {
    treatment.steps = [];
  }
  treatment.steps.push(defaultStep());
};

const removeStep = (treatmentIndex, stepIndex) => {
  const treatment = formData.value.treatments[treatmentIndex];
  if (treatment && treatment.steps) {
    treatment.steps.splice(stepIndex, 1);
  }
};

const getTreatmentTypeLabel = (type) => {
  const labels = {
    'filling': 'Filling',
    'root_canal': 'Root Canal',
    'extraction': 'Extraction',
    'crown': 'Crown',
    'cleaning': 'Cleaning',
    'bridge': 'Bridge',
    'implant': 'Implant',
    'orthodontics': 'Orthodontics',
    'other_treatment': 'Other Treatment'
  };
  return labels[type] || type || 'Not specified';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    'initial': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'diagnosis_planned': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'treatment_planned': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'undergoing_treatment': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'monitoring': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };
  return classes[status] || classes['initial'];
};

const getStatusBackgroundClass = (status) => {
  const classes = {
    'initial': 'bg-gray-400/20 text-gray-700 dark:text-gray-300',
    'diagnosis_planned': 'bg-blue-500/20 text-blue-100',
    'treatment_planned': 'bg-indigo-500/20 text-indigo-100',
    'undergoing_treatment': 'bg-yellow-500/20 text-yellow-100',
    'monitoring': 'bg-purple-500/20 text-purple-100',
    'completed': 'bg-green-500/20 text-green-100',
    'cancelled': 'bg-red-500/20 text-red-100'
  };
  return classes[status] || classes['initial'];
};

const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatStepStatus = (status) => {
  const labels = {
    'pending': 'Pending',
    'in_progress': 'In Progress',
    'done': 'Done',
    'skipped': 'Skipped'
  };
  return labels[status] || status;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const getStepStatusColor = (status) => {
  const colors = {
    'pending': 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'in_progress': 'bg-blue-200 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'done': 'bg-green-200 text-green-700 dark:bg-green-900 dark:text-green-300',
    'skipped': 'bg-red-200 text-red-700 dark:bg-red-900 dark:text-red-300'
  };
  return colors[status] || colors['pending'];
};

const getStepStatusBadgeClass = (status) => {
  const colors = {
    'pending': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'in_progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    'done': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    'skipped': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
  };
  return colors[status] || colors['pending'];
};

const getStepDotColor = (status) => {
  const colors = {
    'pending': 'bg-gray-300 dark:bg-gray-600',
    'in_progress': 'bg-blue-400 dark:bg-blue-500',
    'done': 'bg-green-400 dark:bg-green-500',
    'skipped': 'bg-red-400 dark:bg-red-500'
  };
  return colors[status] || colors['pending'];
};

const getStepStatusTextColor = (status) => {
  const colors = {
    'pending': 'text-gray-700 dark:text-gray-300',
    'in_progress': 'text-blue-700 dark:text-blue-300',
    'done': 'text-green-700 dark:text-green-300',
    'skipped': 'text-red-700 dark:text-red-300'
  };
  return colors[status] || colors['pending'];
};

watch(() => props.recordDataProp, (newVal) => {
  if (newVal && newVal.id) { // Editing an existing record
    isEditing.value = true;
    let conditionValue = newVal.condition || '';
    let otherConditionTextValue = '';
    if (conditionValue && !predefinedConditions.includes(conditionValue)) {
      otherConditionTextValue = conditionValue;
      conditionValue = 'other';
    }

    formData.value = {
      id: newVal.id,
      tooth_number: newVal.tooth_number,
      condition: conditionValue,
      other_condition_text: otherConditionTextValue,
      notes: newVal.notes || '',
      status: newVal.status || 'initial',
      treatments: (newVal.treatments && newVal.treatments.length > 0)
        ? JSON.parse(JSON.stringify(newVal.treatments)).map(t => ({
            ...defaultTreatment(),
            ...t,
            xray_image: null, 
            xray_image_name: t.xray_image_url ? '' : (t.xray_image_name || ''),
            steps: t.steps ? JSON.parse(JSON.stringify(t.steps)).map(s => ({ ...defaultStep(), ...s })) : []
          }))
        : [defaultTreatment()]
    };
  } else {
    isEditing.value = false;
    formData.value = {
      ...initialFormData(),
      tooth_number: props.initialToothNumberProp || formData.value.tooth_number,
    };
    if (!formData.value.treatments || formData.value.treatments.length === 0) {
        formData.value.treatments = [defaultTreatment()];
    }
  }
  error.value = null;
}, { immediate: true, deep: true });

watch(() => props.initialToothNumberProp, (newVal) => {
  if (!isEditing.value && newVal && formData.value.tooth_number !== newVal) {
    formData.value.tooth_number = newVal;
  }
}, { immediate: true });

const handleSubmit = async () => {
  error.value = null;
  isSubmitting.value = true;
  const token = getAccessTokenCookie();
  if (!token) {
    isSubmitting.value = false;
    return;
  }

  if (!formData.value.tooth_number) {
    error.value = 'Tooth number is required.';
    isSubmitting.value = false;
    scrollToSection('basics');
    return;
  }
  
  if (!formData.value.condition || (formData.value.condition === 'other' && !formData.value.other_condition_text)) {
    error.value = formData.value.condition === 'other' ? 'Please specify the other condition.' : 'Condition is required.';
    isSubmitting.value = false;
    scrollToSection('basics');
    return;
  }
  
  // Validate treatments and steps
  if (formData.value.treatments && formData.value.treatments.length > 0) {
    for (let i = 0; i < formData.value.treatments.length; i++) {
      const treatment = formData.value.treatments[i];
      if (!treatment.treatment_type) {
        error.value = `Treatment type is required for Treatment #${i + 1}.`;
        isSubmitting.value = false;
        scrollToSection('treatments');
        return;
      }
      if (treatment.steps) {
        for (let j = 0; j < treatment.steps.length; j++) {
          const step = treatment.steps[j];
          if (!step.description) {
            error.value = `Description is required for Step #${j + 1} in Treatment #${i + 1}.`;
            isSubmitting.value = false;
            scrollToSection('treatments');
            return;
          }
          if (!step.status) {
             error.value = `Status is required for Step #${j + 1} in Treatment #${i + 1}.`;
             isSubmitting.value = false;
             scrollToSection('treatments');
             return;
          }
        }
      }
    }
  }

  let finalCondition = formData.value.condition;
  if (formData.value.condition === 'other') {
    finalCondition = formData.value.other_condition_text;
  }

  // Prepare payload (strip UI-specific properties)
  const payload = {
    tooth_number: formData.value.tooth_number,
    condition: finalCondition,
    notes: formData.value.notes,
    status: formData.value.status,
    treatments: formData.value.treatments.map(t => {
      const { _expanded, ...treatment } = t; // Remove UI state
      return {
        ...treatment,
        treatment_type: treatment.treatment_type,
        cost: treatment.cost ? parseFloat(treatment.cost) : undefined,
        notes: treatment.notes,
        xray_taken: treatment.xray_taken,
        xray_image_url: treatment.xray_taken 
          ? (treatment.xray_image ? `PENDING_UPLOAD_${treatment.xray_image_name}` : treatment.xray_image_url || undefined) 
          : undefined,
        steps: treatment.steps?.map((step, index) => ({
          step_order: index + 1,
          description: step.description,
          step_date: step.step_date || null,
          status: step.status
        }))
      };
    })
  };

  // Clean payload
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === '') {
      if (key !== 'notes') {
        delete payload[key];
      }
    }
  });
  
  payload.treatments = payload.treatments.map(treatment => {
    const cleanedTreatment = { ...treatment };
    Object.keys(cleanedTreatment).forEach(tKey => {
      if (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '' || (Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) ) {
        if (tKey === 'steps' && Array.isArray(cleanedTreatment[tKey]) && cleanedTreatment[tKey].length === 0) {
           delete cleanedTreatment[tKey]; 
        } else if (tKey !== 'notes' && (cleanedTreatment[tKey] === undefined || cleanedTreatment[tKey] === '')) {
           delete cleanedTreatment[tKey];
        }
      }
    });
    if (cleanedTreatment.steps) {
      cleanedTreatment.steps = cleanedTreatment.steps.map(step => {
        const cleanedStep = { ...step };
        Object.keys(cleanedStep).forEach(sKey => {
          if (cleanedStep[sKey] === undefined || cleanedStep[sKey] === '' || cleanedStep[sKey] === null) {
             if (sKey === 'step_date' && cleanedStep[sKey] === null) {
                // keep it as null
             } else if (sKey !== 'description' && (cleanedStep[sKey] === undefined || cleanedStep[sKey] === '' || cleanedStep[sKey] === null)) {
                delete cleanedStep[sKey];
             }
          }
        });
        return cleanedStep;
      });
       if (cleanedTreatment.steps.length === 0) delete cleanedTreatment.steps;
    }
    return cleanedTreatment;
  });

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    const url = `${config.public.API_BASE_URL}/patients/${props.patientId}/dental-records`;
    
    const response = await axios.post(url, payload, { headers });

    // Success message and notify parent
    scrollToTop();
    emit('record-saved', response.data);
  } catch (err) {
    console.error('Error saving dental record:', err.response ? err.response.data : err);
    let errorMessage = 'An unexpected error occurred. Please check your connection and try again.';
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage = 'Session expired or unauthorized. Please log in again.';
        emit('error', errorMessage);
      } else if (err.response.data) {
        if (err.response.data.error) {
          errorMessage = `Failed to save: ${err.response.data.error}`;
        } else if (err.response.data.detail) {
           if (typeof err.response.data.detail === 'string') {
              errorMessage = `Failed to save: ${err.response.data.detail}`;
          } else if (Array.isArray(err.response.data.detail)) {
              const messages = err.response.data.detail.map(d => `${d.loc.join(' -> ')}: ${d.msg}`).join('; ');
              errorMessage = `Validation failed: ${messages}`;
          } else {
              errorMessage = 'Validation failed. Please check your input.';
          }
        } else if (err.response.data.errors) {
          const messages = Object.values(err.response.data.errors).flat();
          errorMessage = `Validation failed: ${messages.join('; ')}`;
        } else {
          errorMessage = `An error occurred (Status: ${err.response.status}). Please try again.`;
        }
      }
    }
    error.value = errorMessage;
    scrollToTop();
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (props.isCreatingNew && !props.recordDataProp && !props.initialToothNumberProp) {
      formData.value = initialFormData();
      isEditing.value = false;
  }
  
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>

<style scoped>
.form-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.form-group {
  @apply space-y-1;
}

.button-primary {
  @apply px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors dark:focus:ring-offset-gray-900 flex items-center;
}

.button-primary-sm {
  @apply px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-colors dark:focus:ring-offset-gray-900;
}

.button-secondary {
  @apply px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors;
}

.condition-card {
  @apply cursor-pointer rounded-md border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors;
}

.condition-selected {
  @apply border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30;
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
