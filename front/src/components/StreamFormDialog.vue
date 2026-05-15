<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { StreamPublic, StreamCreate, StreamUpdate } from '@/api/client/types.gen'

const props = defineProps<{
  modelValue: boolean
  mode: 'view' | 'create' | 'edit'
  initialData?: StreamPublic | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: StreamCreate | StreamUpdate]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

interface LocalForm {
  name: string
}
const emptyForm: LocalForm = { name: '' }
const form = reactive<LocalForm>({ ...emptyForm })

// Запоминаем исходные данные, чтобы при редактировании отправлять только изменённые поля
const originalData = ref<LocalForm>({ ...emptyForm })

const isViewMode = computed(() => props.mode === 'view')
const title = computed(() => {
  if (props.mode === 'view') return 'Просмотр потока'
  return props.mode === 'edit' ? 'Редактирование потока' : 'Новый поток'
})

const rules: FormRules = {
  name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
}

watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        if (props.mode === 'create') {
          Object.assign(form, { ...emptyForm })
          originalData.value = { ...emptyForm }
        } else if (props.initialData) {
          const data: LocalForm = {
            name: props.initialData.name,
          }
          Object.assign(form, data)
          originalData.value = { ...data }
        }
        submitting.value = false
        nextTick(() => formRef.value?.clearValidate())
      }
    }
)

function resetForm() {
  formRef.value?.resetFields()
  submitting.value = false
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (props.mode === 'create') {
      const createData: StreamCreate = {
        name: form.name,
      }
      emit('submit', createData)
    } else {
      // Для StreamUpdate собираем только изменённые поля
      const updateData: StreamUpdate = {}
      if (form.name !== originalData.value.name) {
        updateData.name = form.name
      }
      emit('submit', updateData)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
      :model-value="modelValue"
      :title="title"
      :width="'min(500px, 90vw)'"
      @update:model-value="$emit('update:modelValue', $event)"
      @closed="resetForm"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="isViewMode ? {} : rules"
        label-width="100px"
    >
      <el-form-item label="Название" prop="name">
        <el-input v-model="form.name" :disabled="isViewMode" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Отмена</el-button>
      <el-button
          v-if="!isViewMode"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
      >
        {{ mode === 'edit' ? 'Сохранить' : 'Создать' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>