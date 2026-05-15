<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  StudentPrivate,
  StudentCreate,
  StudentUpdate,
  GroupPublic,
} from '@/api/client/types.gen'

const props = defineProps<{
  modelValue: boolean
  mode: 'view' | 'create' | 'edit'
  initialData?: StudentPrivate | null
  groups: GroupPublic[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: StudentCreate | StudentUpdate]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

interface LocalForm {
  name: string
  group_id: number | null
  phone_number: string | null
  email: string | null
}

const emptyForm: LocalForm = {
  name: '',
  group_id: null,
  phone_number: null,
  email: null,
}
const form = reactive<LocalForm>({ ...emptyForm })
const originalData = ref<LocalForm>({ ...emptyForm })

const isViewMode = computed(() => props.mode === 'view')
const title = computed(() => {
  if (props.mode === 'view') return 'Просмотр студента'
  return props.mode === 'edit' ? 'Редактирование студента' : 'Новый студент'
})

const validatePhone = (_rule: any, value: string | null, callback: any) => {
  if (!value) return callback()
  const phoneRegex = /^\+?[0-9\s\-().]{7,15}$/
  if (!phoneRegex.test(value)) {
    callback(new Error('Введите корректный номер телефона'))
  } else {
    callback()
  }
}

const validateEmail = (_rule: any, value: string | null, callback: any) => {
  if (!value) return callback()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    callback(new Error('Введите корректный email'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  name: [{ required: true, message: 'Введите ФИО', trigger: 'blur' }],
  group_id: [{ required: true, message: 'Выберите группу', trigger: 'change' }],
  phone_number: [{ validator: validatePhone, trigger: 'blur' }],
  email: [{ validator: validateEmail, trigger: 'blur' }],
}

const groupName = computed(() => {
  if (form.group_id != null) {
    const g = props.groups.find((g) => g.id === form.group_id)
    return g?.name ?? '—'
  }
  return '—'
})

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
            group_id: props.initialData.group_id,
            phone_number: props.initialData.phone_number ?? null,
            email: props.initialData.email ?? null,
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
      const createData: StudentCreate = {
        name: form.name,
        group_id: form.group_id as number,
        phone_number: form.phone_number,
        email: form.email,
      }
      emit('submit', createData)
    } else {
      const updateData: StudentUpdate = {}
      if (form.name !== originalData.value.name) {
        updateData.name = form.name
      }
      if (form.group_id !== originalData.value.group_id) {
        updateData.group_id = form.group_id
      }
      if (form.phone_number !== originalData.value.phone_number) {
        updateData.phone_number = form.phone_number
      }
      if (form.email !== originalData.value.email) {
        updateData.email = form.email
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
        label-width="120px"
    >
      <el-form-item label="ФИО" prop="name">
        <el-input v-model="form.name" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="Группа" :prop="isViewMode ? '' : 'group_id'">
        <el-select
            v-if="!isViewMode"
            v-model="form.group_id"
            placeholder="Выберите группу"
            :disabled="isViewMode"
        >
          <el-option
              v-for="g in groups"
              :key="g.id"
              :label="g.name"
              :value="g.id"
          />
        </el-select>
        <span v-else>{{ groupName || '—' }}</span>
      </el-form-item>
      <el-form-item label="Телефон" prop="phone_number">
        <el-input v-model="form.phone_number" :disabled="isViewMode" />
      </el-form-item>
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" :disabled="isViewMode" />
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