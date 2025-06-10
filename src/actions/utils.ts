'use server'

// Lib Imports
import apiInstance from '@/lib/api'

export async function fetchStates() {
  const api = await apiInstance()

  try {
    const res = await api.get(`/utils/states`)
    return res.data

    // eslint-disable-next-line
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function fetchCities() {
  const api = await apiInstance()

  try {
    const res = await api.get(`/utils/cities`)
    return res.data

    // eslint-disable-next-line
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function fetchCategories() {
  const api = await apiInstance()

  try {
    const res = await api.get(`/category?limit=30`)
    return res.data

    // eslint-disable-next-line
  } catch (error: any) {
    throw new Error(error.message)
  }
}
