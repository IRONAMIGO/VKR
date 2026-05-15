<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useStudents } from '@/composables/useStudents'
import { useGroups } from '@/composables/useGroups'
import { useReferences } from '@/composables/useReferences'
import type { StudentPrivate } from '@/api/client/types.gen'
import { getPhotoUrl } from '@/utils/photoUrl'
import StudentFormDialog from '@/components/StudentFormDialog.vue'
import {Back} from "@element-plus/icons-vue";

const route = useRoute()
const router = useRouter()
const studentId = Number(route.params.id)

const { fetchStudent, updateStudent } = useStudents()
const { items: groups, fetchGroups } = useGroups()
const studentIdRef = ref<number>(studentId)
const { photos, loading: photosLoading, fetchPhotos, uploadPhoto, deletePhoto } = useReferences(studentIdRef)

const student = ref<StudentPrivate | null>(null)
const loading = ref(false)
const groupsLoaded = ref(false)

const dialogVisible = ref(false)

// Загрузка студента
async function loadStudent() {
  loading.value = true
  try {
    const data = await fetchStudent(studentId)
    student.value = data ?? null
  } catch (e: any) {
    ElMessage.error('Не удалось загрузить данные студента')
  } finally {
    loading.value = false
  }
}

// Загрузка групп (для диалога редактирования)
async function loadGroups() {
  await fetchGroups()
  groupsLoaded.value = true
}

// Обработчик сохранения из диалога
async function handleStudentUpdate(updateData: any) {
  if (!student.value) return
  await updateStudent(student.value.id, updateData)
  dialogVisible.value = false
  await loadStudent() // обновить данные на странице
}

// Фото
const uploadLoading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploadLoading.value = true
  await uploadPhoto(file)
  uploadLoading.value = false
  input.value = ''
}

async function handleDeletePhoto(photoId: number) {
  await deletePhoto(photoId)
}

onMounted(() => {
  loadStudent()
  loadGroups()
  fetchPhotos()
})
</script>

<template>
  <div class="student-detail-page">
    <el-button @click="router.push('/students')" type="default" style="margin-bottom: 16px" :icon="Back">
      Назад к списку
    </el-button>

    <el-card v-if="student" class="student-card">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <h2>{{ student.name }}</h2>
          <el-button type="primary" @click="dialogVisible = true">
            Редактировать
          </el-button>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ student.id }}</el-descriptions-item>
        <el-descriptions-item label="Группа">
          {{ groups.find(g => g.id === student?.group_id)?.name ?? '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="Телефон">{{ student.phone_number || '—' }}</el-descriptions-item>
        <el-descriptions-item label="Email">{{ student.email || '—' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div v-else-if="loading" v-loading="loading" style="min-height: 200px" />

    <h3 style="margin-top: 24px">Эталонные фотографии</h3>

    <div style="margin-bottom: 16px">
      <el-button type="primary" :loading="uploadLoading" @click="triggerUpload">
        Загрузить фото
      </el-button>
      <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png"
          style="display: none"
          @change="handleFileChange"
      />
    </div>

    <div v-if="photosLoading" class="loading-text">Загрузка фотографий...</div>
    <div v-else-if="photos.length" class="photo-grid">
      <el-card v-for="photo in photos" :key="photo.id" class="photo-card">
        <el-image
            style="width: 100%; height: 150px; border-radius: 8px"
            :alt="'Фото ' + photo.id"
            :src="getPhotoUrl(photo.image_path)"
            fit="cover"
            :preview-src-list="[getPhotoUrl(photo.image_path)]"
            :hide-on-click-modal=true
            :scale ="1.2"
            :max-scale="2"
            :min-scale="0.5"
        />
        <div class="photo-date">Загружено {{ new Date(photo.created_at).toLocaleDateString() }}</div>
        <div class="photo-actions">
          <el-button size="small" type="danger" @click="handleDeletePhoto(photo.id)">Удалить</el-button>
        </div>
      </el-card>
    </div>
    <el-empty v-else description="Нет загруженных фотографий" />

    <StudentFormDialog
        v-model="dialogVisible"
        mode="edit"
        :initial-data="student"
        :groups="groups"
        @submit="handleStudentUpdate"
    />
  </div>
</template>

<style scoped>
.student-detail-page {
  padding: 16px;
}
.student-card {
  margin-bottom: 24px;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.photo-card {
  text-align: center;
}
.photo-date {
  font-size: 12px;
  color: #909399;
  margin: 8px 0;
}
.photo-actions {
  padding-bottom: 8px;
}
.loading-text {
  text-align: center;
  padding: 40px;
  color: #909399;
}
</style>