<template>
  <div>
    <v-overlay :value="loading" absolute>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-card color="card" class="rounded-xl">
      <v-toolbar color="toolbar">
        <v-toolbar-title> Reports </v-toolbar-title>
      </v-toolbar>
      <v-alert v-if="reportsError" type="warning" text class="ma-4">{{
        reportsError
      }}</v-alert>
      <v-data-table
        v-else
        :items="reports"
        :headers="headers.reports"
        :loading="reportsLoading"
        :style="
          'background-color: ' +
          $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
        "
      >
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            :loading="downloading[item.cycleId]"
            @click="downloadReport(item)"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-card color="card" class="rounded-xl mt-4">
      <v-toolbar color="toolbar">
        <v-toolbar-title> Progress Reports </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title v-if="cycles.length">
          <v-select
            :items="cycles"
            item-value="id"
            item-text="title"
            v-model="selectedCycle"
            solo
            hide-details
            single-line
          ></v-select>
        </v-toolbar-title>
      </v-toolbar>
      <v-alert v-if="!cycles.length" type="info" text class="ma-4">
        No progress report cycles are currently available.
      </v-alert>
      <template v-else>
        <Bar
          v-if="chartData.init && !$vuetify.breakpoint.mobile"
          :chart-options="chartOptions"
          :chart-data="chartData"
          :height="150"
        />
        <v-data-table
          :items="progressReports.entities"
          :headers="headers.progress"
          :loading="loading"
          :style="
            'background-color: ' +
            $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light'].card
          "
        >
          <template v-slot:item.name="{ item }">
            <span v-html="item.name"></span>
          </template>
        </v-data-table>
      </template>
    </v-card>
  </div>
</template>

<script>
import { Bar } from "vue-chartjs/legacy"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js"
import colors from "vuetify/lib/util/colors"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
export default {
  name: "UserReports",
  components: { Bar },
  props: ["user"],
  data() {
    return {
      chartData: {
        init: false,
        labels: [],
        datasets: []
      },
      chartOptions: {
        responsive: true
      },
      loading: true,
      reportsLoading: true,
      reportsError: "",
      cycles: [],
      selectedCycle: null,
      headers: {
        reports: [
          { text: "Reporting Cycle", value: "t" },
          { text: "School", value: "schoolName" },
          { text: "Actions", value: "actions" }
        ],
        progress: [{ text: "Subject", value: "name" }]
      },
      reports: [],
      downloading: {},
      progressReports: {}
    }
  },
  methods: {
    calculateFriendlyAOAForEntity(entity) {
      let results = []
      entity.results.forEach(function (area) {
        const areaOfAssessment =
          this.progressReports.aoas[
            this.progressReports.aoas.findIndex((x) => x.id === area.id)
          ]
        const friendlyName = areaOfAssessment.options.find(
          (x) => x.id === area.result
        )
        console.log(friendlyName.value)
        results.push(friendlyName.value)
      }, this)
      return results
    },
    calculateFriendlyAOA(area) {
      const areaOfAssessment =
        this.progressReports.aoas[
          this.progressReports.aoas.findIndex((x) => x.id === area.id)
        ]
      const friendlyName = areaOfAssessment.options.find(
        (x) => x.id === area.result
      )
      return {
        text: `(${friendlyName.value}) ${friendlyName.title}`,
        value: friendlyName.value
      }
    },
    randomColorGenerator(index) {
      const approvedColors = [
        "green",
        "indigo",
        "red",
        "orange",
        "blue",
        "purple",
        "amber",
        "lightGreen",
        "deepPurple",
        "yellow",
        "teal",
        "cyan",
        "pink",
        "lime",
        "grey",
        "deepOrange",
        "blueGrey"
      ]
      const randomColor = colors[approvedColors[index % approvedColors.length]]
      console.log(colors)
      return randomColor.base
    },
    progressReportTable() {
      this.progressReports.aoas.forEach(function (area) {
        this.chartData.labels.push(area.title)
        this.headers.progress.push({
          text: area.title,
          value: "result." + area.id,
          id: area.id,
          options: area.options
        })
      }, this)
      this.headers.progress.push({
        text: "Total",
        value: "total"
      })
      this.progressReports.entities.forEach(function (entity, index) {
        const color = this.randomColorGenerator(index)
        this.chartData.datasets.push({
          label: entity.name.split("<br />")[0],
          data: this.calculateFriendlyAOAForEntity(entity),
          backgroundColor: [color, color, color, color, color, color]
        })
        if (!entity.result) {
          entity.result = {}
        }
        entity.results.forEach(function (area) {
          if (!entity.total) {
            entity.total = 0
          }
          entity.result[area.id] = this.calculateFriendlyAOA(area).text
          entity.total = entity.total + this.calculateFriendlyAOA(area).value
        }, this)
      }, this)
      this.chartData.init = true
    },
    // The plain downloadable PDF "Reports" list is completely independent
    // of progress-report cycles (confirmed via HAR: this endpoint returns
    // real data even when GetCyclesByUser comes back empty), so it's
    // fetched on its own instead of being nested behind the dead
    // GetActivitiesOverviewConfig call the old code used to gate it on.
    getDownloadableReports() {
      this.reportsLoading = true
      this.reportsError = ""
      this.axios
        .post("/Services/Reports.svc/GetMyReportsList", {
          userId: (this.user && this.user.userId) || this.$store.state.user.userId,
          page: 1,
          start: 0,
          limit: 50
        })
        .then((res) => {
          this.reports = res.data.d || []
          this.reportsLoading = false
        })
        .catch((e) => {
          console.error("BCX reports list:", e)
          this.reportsError = "Compass would not return your reports list."
          this.reportsLoading = false
        })
    },
    // The `l` link Compass hands back from GetMyReportsList ("asyncDownload:
    // true, canDownload: false") is NOT a directly-fetchable file - the
    // real site never GETs that URL at all. Confirmed via HAR: clicking
    // download on the real Compass site actually does a 3-step job:
    //   1. LongRunningFileRequest.svc/QueueTask (type "9", with a JSON
    //      *string* of {cycleId, schoolId, userId} as `parameters`) ->
    //      returns a generationSessionId guid.
    //   2. PollTaskStatus with that guid, repeated until requestStatus === 3
    //      (ready).
    //   3. GET /Services/Reports/Download?cycleId=&schoolId=&userId=&generationSessionId=
    //      - a completely different query-string shape to `item.l`, and
    //      this is the one that actually returns the PDF.
    downloadReport(item) {
      this.$set(this.downloading, item.cycleId, true)
      const userId =
        item.userIdForSchool ||
        (this.user && this.user.userId) ||
        this.$store.state.user.userId
      const schoolId = item.schoolId
      const cycleId = item.cycleId

      const poll = (guid, attemptsLeft) => {
        if (attemptsLeft <= 0) {
          throw new Error("timed out waiting for the report to generate")
        }
        return this.axios
          .post("/Services/LongRunningFileRequest.svc/PollTaskStatus", { guid })
          .then((res) => {
            const status = res.data.d && res.data.d.requestStatus
            if (status === 3) {
              return guid
            }
            return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
              poll(guid, attemptsLeft - 1)
            )
          })
      }

      this.axios
        .post("/Services/LongRunningFileRequest.svc/QueueTask", {
          type: "9",
          parameters: JSON.stringify({ cycleId, schoolId, userId })
        })
        .then((res) => {
          const guid = res.data.d
          if (!guid) {
            throw new Error("no generation session id returned")
          }
          return poll(guid, 30)
        })
        .then((guid) => {
          const url =
            "/Services/Reports/Download?cycleId=" +
            encodeURIComponent(cycleId) +
            "&schoolId=" +
            encodeURIComponent(schoolId) +
            "&userId=" +
            encodeURIComponent(userId) +
            "&generationSessionId=" +
            encodeURIComponent(guid)
          window.open(url, "_blank")
          this.$set(this.downloading, item.cycleId, false)
        })
        .catch((e) => {
          console.error("BCX report download:", e)
          this.$toast.error("That report could not be downloaded.")
          this.$set(this.downloading, item.cycleId, false)
        })
    },
    getCycles() {
      this.axios
        .post("/Services/Gpa.svc/GetCyclesByUser", {
          userId: (this.user && this.user.userId) || this.$store.state.user.userId,
          page: 1,
          start: 0,
          limit: 25
        })
        .then((response) => {
          this.cycles = response.data.d || []
          if (this.cycles.length) {
            this.selectedCycle = this.cycles[0].id
          } else {
            // No progress report cycles right now - this is normal, not an
            // error, so don't toast or get stuck: just show the "none
            // available" message in the template.
            this.loading = false
          }
        })
        .catch(() => {
          this.cycles = []
          this.loading = false
          this.$toast.error("The report cycles could not be loaded.")
        })
    },
    getReports() {
      if (!this.selectedCycle) {
        this.loading = false
        return
      }
      this.axios
        .post("/Services/Gpa.svc/GetResultsByCycleAndStudent", {
          entityId: this.user.userId,
          cycleId: this.selectedCycle,
          editing: true
        })
        .then((res) => {
          this.progressReports = res.data.d
          this.progressReportTable()
          this.loading = false
        })
        .catch(() => {
          this.axios
            .post("/Services/Gpa.svc/GetResultsByCycleAndStudent", {
              entityId: this.$store.state.user.userId,
              cycleId: this.selectedCycle,
              editing: true
            })
            .then((res) => {
              this.progressReports = res.data.d
              this.axios
                .post("/Services/Gpa.svc/GetActivitiesForStaffByCycle", {
                  userId: this.user.userId,
                  cycleId: this.selectedCycle,
                  page: 1,
                  start: 0,
                  limit: 25
                })
                .then((cycleActivities) => {
                  this.axios
                    .post("/Services/Gpa.svc/GetOverviewGraphDataForActivities", {
                      cycleIds: [this.selectedCycle],
                      activityIds: cycleActivities.data.d.map(function (
                        activity
                      ) {
                        return activity.id
                      }),
                      userId: this.user.userId
                    })
                    .then((resp) => {
                      //set res.data.d to this.progressReports.entities with extra JSON data foreach
                      this.progressReports.entities = []
                      resp.data.d.forEach(function (entity) {
                        this.progressReports.entities.push({
                          results: entity.ActivityCyclesGraphLines[0]?.Results
                            ? entity.ActivityCyclesGraphLines[0]?.Results
                            : [],
                          activityId: entity.ActivityId,
                          //lookup activity with ActivityId
                          name: cycleActivities.data.d.find(function (
                            activity
                          ) {
                            return activity.id === entity.ActivityId
                          }).name
                        })
                      }, this)
                      this.progressReportTable()
                      this.loading = false
                    })
                    .catch(() => {
                      this.loading = false
                    })
                })
                .catch(() => {
                  this.loading = false
                })
            })
            .catch(() => {
              this.loading = false
              this.$toast.error("The reports overview could not be loaded.")
            })
        })
    }
  },
  mounted() {
    this.$store.dispatch("getUserInfo").then(() => {
      this.getDownloadableReports()
      this.getCycles()
    })
  },
  watch: {
    selectedCycle() {
      this.chartData.init = false
      this.chartData.datasets = []
      this.chartData.labels = []
      this.headers.progress = [{ text: "Subject", value: "name" }]
      this.loading = true
      this.getReports()
    }
  }
}
</script>

<style scoped></style>
