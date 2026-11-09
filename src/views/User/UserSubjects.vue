<template>
  <div>
    <v-container>
      <v-alert
        v-if="error"
        type="warning"
        text
        class="mb-4"
        style="white-space: pre-wrap"
        >{{ error }}</v-alert
      >
      <v-data-table
        :items="classes"
        :headers="headers"
        :loading="loading"
        @click:row="handleClick"
        style="cursor: pointer"
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
        "
      >
      </v-data-table>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "UserSubjects",
  props: ["user"],
  data() {
    return {
      classes: [],
      error: "",
      headers: [
        {
          text: "Class",
          value: "name"
        },
        {
          text: "Subject",
          value: "subjectLongName"
        },
        {
          text: "Faculty",
          value: "facultyName"
        },
        {
          text: "Year",
          value: "yearLevelShortName"
        }
      ],
      loading: true
    }
  },
  methods: {
    handleClick(item) {
      this.$router.push("/activity/activity/" + item.id)
    },
    // Compass renamed this from the old Gpa.svc/GetActivitiesOverviewConfig
    // call (which no longer returns usable data) to
    // Subjects.svc/GetStandardClassesOfUserInAcademicGroup.
    getSubjects() {
      this.loading = true
      this.error = ""
      // `this.user` can still be null here if this page is the first one
      // opened (the parent View hasn't finished loading it yet), which
      // used to throw synchronously below and leave the spinner stuck
      // forever with no request ever sent - fall back to the store, which
      // getUserInfo (dispatched in mounted()) guarantees is populated by
      // the time this runs.
      this.axios
        .post("/Services/Subjects.svc/GetStandardClassesOfUserInAcademicGroup", {
          userId: (this.user && this.user.userId) || this.$store.state.user.userId,
          limit: 100,
          start: 0,
          page: 1,
          academicGroupId: -1
        })
        .then((res) => {
          this.classes = (res.data.d && res.data.d.data) || []
          this.loading = false
        })
        .catch((e) => {
          console.error("BCX subjects:", e)
          this.error =
            "Compass would not return your classes." +
            (e.response ? " (HTTP " + e.response.status + ")" : "")
          this.loading = false
        })
    }
  },
  mounted() {
    this.$store.dispatch("getUserInfo").then(() => {
      this.getSubjects()
    })
  }
}
</script>

<style scoped></style>
