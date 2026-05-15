<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { GroupPublic, GroupCreate, GroupUpdate, StreamPublic } from '@/api/client/types.gen'

const props = defineProps<{
  modelValue: boolean
  mode: 'view' | 'create' | 'edit'
  initialData?: GroupPublic | null
  streams: StreamPublic[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: GroupCreate | GroupUpdate]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)

interface LocalForm {
  name: string
  stream_id: number | null
}

const emptyForm: LocalForm = { name: '', stream_id: null }
const form = reactive<LocalForm>({ ...emptyForm })
const originalData = ref<LocalForm>({ ...emptyForm })

const isViewMode = computed(() => props.mode === 'view')
const title = computed(() => {
  if (props.mode === 'view') return 'Просмотр группы'
  return props.mode === 'edit' ? 'Редактирование группы' : 'Новая группа'
})

const rules: FormRules = {
  name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
  stream_id: [{ required: true, message: 'Выберите поток', trigger: 'change' }],
}

const streamName = computed(() => {
  if (form.stream_id != null) {
    const s = props.streams.find((s) => s.id === form.stream_id)
    return s?.name ?? '—'
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
            stream_id: props.initialData.stream_id,
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
      const createData: GroupCreate = {
        name: form.name,
        stream_id: form.stream_id as number,
      }
      emit('submit', createData)
    } else {
      // GroupUpdate: только изменённые поля
      const updateData: GroupUpdate = {}
      if (form.name !== originalData.value.name) {
        updateData.name = form.name
      }
      if (form.stream_id !== originalData.value.stream_id) {
        updateData.stream_id = form.stream_id
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
      <el-form-item label="Поток" :prop="isViewMode ? '' : 'stream_id'">
        <el-select
            v-if="!isViewMode"
            v-model="form.stream_id"
            placeholder="Выберите поток"
            :disabled="isViewMode"
        >
          <el-option v-for="s in streams" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
        <span v-else>{{ streamName || '—' }}</span>
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