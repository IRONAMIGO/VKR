<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type {
  RecognitionResultPublicWithStudent,
  StudentPublicWithGroup,
  GroupPublic,
  StreamPublic
} from '@/api/client/types.gen'

const props = defineProps<{
  modelValue: boolean
  initialResult?: RecognitionResultPublicWithStudent | null
  students: StudentPublicWithGroup[]
  groups: GroupPublic[]
  streams: StreamPublic[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: { resultId: number; studentId: number | null }]
}>()

// selectedStudentRaw: пустая строка = "Неизвестный", иначе числовой id студента
const selectedStudentRaw = ref<string | number>('')
const selectedStreamId = ref<number | null>(null)
const selectedGroupId = ref<number | null>(null)

// при открытии сбрасываем состояние
watch(() => props.modelValue, (val) => {
  if (val) {
    const studentId = props.initialResult?.student_id ?? null
    selectedStudentRaw.value = studentId === null ? '' : studentId

    if (props.initialResult?.student) {
      const gid = props.initialResult.student.group_id
      selectedGroupId.value = gid ?? null
      if (gid) {
        const group = props.groups.find(g => g.id === gid)
        selectedStreamId.value = group?.stream_id ?? null
      } else {
        selectedStreamId.value = null
      }
    } else {
      selectedStreamId.value = null
      selectedGroupId.value = null
    }
  }
})

const filteredGroups = computed(() => {
  if (!selectedStreamId.value) return props.groups
  return props.groups.filter(g => g.stream_id === selectedStreamId.value)
})

const filteredStudents = computed(() => {
  if (!selectedGroupId.value && !selectedStreamId.value) return props.students
  return props.students.filter(st => {
    if (selectedGroupId.value && st.group_id !== selectedGroupId.value) return false
    if (selectedStreamId.value && !selectedGroupId.value) {
      const groupStreams = filteredGroups.value.map(g => g.id)
      return st.group_id && groupStreams.includes(st.group_id)
    }
    return true
  })
})

function handleStreamChange() {
  selectedGroupId.value = null
  selectedStudentRaw.value = ''   // сброс на "Неизвестный"
}

function handleGroupChange() {
  selectedStudentRaw.value = ''   // сброс на "Неизвестный"
}

async function handleSubmit() {
  if (!props.initialResult) return
  emit('submit', {
    resultId: props.initialResult.id,
    studentId: selectedStudentRaw.value === '' ? null : Number(selectedStudentRaw.value)
  })
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
      :model-value="modelValue"
      title="Изменить привязку студента"
      width="480px"
      @update:model-value="$emit('update:modelValue', $event)"
  >
    <el-form label-width="100px">
      <el-form-item label="Поток">
        <el-select
            v-model="selectedStreamId"
            clearable
            placeholder="Все потоки"
            @change="handleStreamChange"
        >
          <el-option v-for="s in streams" :key="s.id" :label="s.name" :value="s.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Группа">
        <el-select
            v-model="selectedGroupId"
            clearable
            placeholder="Все группы"
            :disabled="!selectedStreamId"
            @change="handleGroupChange"
        >
          <el-option v-for="g in filteredGroups" :key="g.id" :label="g.name" :value="g.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="Студент">
        <el-select
            v-model="selectedStudentRaw"
            clearable
            filterable
            placeholder="Выберите студента"
        >
          <!-- Опция «Неизвестный» со значением пустой строки -->
          <el-option label="Неизвестный" value="" />
          <el-option
              v-for="st in filteredStudents"
              :key="st.id"
              :label="st.name"
              :value="st.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Отмена</el-button>
      <el-button type="primary" @click="handleSubmit">Сохранить</el-button>
    </template>
  </el-dialog>
</template>