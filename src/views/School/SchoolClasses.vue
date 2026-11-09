<template>
  <div>
    <v-container>
      <v-card color="card" elevation="7" class="rounded-xl">
        <v-toolbar color="toolbar">
          <v-toolbar-title> Classes ({{ subjects.length }}) </v-toolbar-title>
        </v-toolbar>
        <v-alert v-if="error" type="warning" text class="ma-4">{{
          error
        }}</v-alert>
        <v-container v-else>
          <v-overlay :value="loading" absolute>
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <v-card
            v-for="(subject, index) in subjects"
            :key="subject.id"
            class="mb-3"
            @click="$router.push('/activity/activity/' + subject.id)"
            color="card"
          >
            <v-container>
              <v-card-title>
                <v-toolbar-title>
                  {{ subject.name }}
                  <div class="subheading subtitle-1">
                    ID: {{ subject.id }} - {{ $store.state.school.name }} -
                    Index: {{ index }}
                  </div>
                </v-toolbar-title>
              </v-card-title>
            </v-container>
          </v-card>
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "SchoolSubjects",
  data() {
    return {
      subjects: [],
      loading: true,
      error: ""
    }
  },
  methods: {
    getSubjects() {
      this.loading = true
      this.error = ""
      this.axios
        .post("/Services/UserInclusion.svc/GetThinClasses", {})
        .then((res) => {
          this.subjects = res.data.d || []
          this.loading = false
        })
        .catch((e) => {
          // Confirmed via HAR: this endpoint 500s unconditionally on this
          // account - it looks like a staff/admin-only view Compass no
          // longer exposes to a student session, so stop the spinner
          // instead of hanging forever with no error shown.
          console.error("BCX school classes:", e)
          this.error =
            "Compass would not return the school classes list" +
            " (this page may require staff access)."
          this.loading = false
        })
    }
  },
  mounted() {
    this.getSubjects()
  }
}
</script>

<style scoped></style>
