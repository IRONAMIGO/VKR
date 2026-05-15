<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRecognition } from '@/composables/useRecognition'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  uploaded: []
}>()

const { recognize } = useRecognition()
const loading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

interface FormData {
  lectureDate: Date | null
  lectureNum: number
  photo: File | null
}

const form = reactive<FormData>({
  lectureDate: null,
  lectureNum: 1,
  photo: null,
})

function resetForm() {
  form.lectureDate = null
  form.lectureNum = 1
  form.photo = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

watch(() => props.modelValue, (val) => {
  if (val) resetForm()
})

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    form.photo = target.files[0]
  }
}

async function submit() {
  if (!form.photo) {
    ElMessage.warning('Выберите фотографию')
    return
  }
  loading.value = true
  try {
    const dateStr = form.lectureDate
        ? `${form.lectureDate.getFullYear()}-${String(form.lectureDate.getMonth() + 1).padStart(2, '0')}-${String(form.lectureDate.getDate()).padStart(2, '0')}`
        : undefined

    await recognize({
      lecture_date: dateStr,
      lecture_num: form.lectureNum,
      photo: form.photo,
    })
    emit('uploaded')
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
      :model-value="modelValue"
      title="Распознать групповое фото"
      :width="'min(500px, 90vw)'"
      :close-on-click-modal="false"
      @update:model-value="emit('update:modelValue', $event)"
      @closed="resetForm"
  >
    <el-form label-width="120px">
      <el-form-item label="Дата лекции">
        <el-date-picker
            v-model="form.lectureDate"
            type="date"
            placeholder="Выберите дату"
            format="DD.MM.YYYY"
            clearable
            style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="Номер пары">
        <el-input-number
            v-model="form.lectureNum"
            :min="1"
            controls-position="right"
            style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="Фотография">
        <input
            ref="fileInputRef"
            type="file"
            accept="image/jpeg,image/png"
            @change="onFileChange"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">Отмена</el-button>
      <el-button type="primary" :loading="loading" @click="submit">
        Отправить
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>