<template>
  <div>
    <v-dialog v-model="chronicle.info" v-if="chronicle.info" max-width="600px">
      <v-card color="card">
        <v-card-title>
          <span class="headline">{{
            chronicle.selected.chronicleEntries[0].templateName
          }}</span>
        </v-card-title>
        <v-card-text>
          <v-chip-group column>
            <v-chip
              color="indigo"
              v-if="chronicle.selected.chronicleEntries[0].attendeeNames"
              >{{ recipientCount(chronicle.selected.chronicleEntries[0]) }}
              recipient(s)</v-chip
            >
            <v-chip
              v-if="chronicle.selected.chronicleEntries[0].visibleToParents"
              >Parents</v-chip
            >
            <v-chip
              v-if="chronicle.selected.chronicleEntries[0].points"
              color="success"
              text-color="white"
              >{{ chronicle.selected.chronicleEntries[0].points }}
              point{{
                chronicle.selected.chronicleEntries[0].points === 1 ? "" : "s"
              }}</v-chip
            >
            <v-chip
              v-if="
                chronicleRatingLabel(
                  chronicle.selected.chronicleEntries[0].rating
                )
              "
              :color="
                chronicleRatingColor(
                  chronicle.selected.chronicleEntries[0].rating
                )
              "
              >{{
                chronicleRatingLabel(
                  chronicle.selected.chronicleEntries[0].rating
                )
              }}</v-chip
            >
          </v-chip-group>
          <div
            v-if="chronicle.selected.chronicleEntries[0].attendeeNames"
            class="mt-2"
          >
            <v-chip
              small
              outlined
              class="mr-1 mb-1"
              v-for="(name, idx) in recipientNames(
                chronicle.selected.chronicleEntries[0]
              )"
              :key="idx"
              >{{ name }}</v-chip
            >
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col>
        <v-alert
          elevation="5"
          class="rounded-xl"
          type="error"
          v-for="flag in user.userFlags"
          :key="flag.id"
        >
          {{ flag.d }}
        </v-alert>
        <v-card color="card" elevation="7" class="rounded-xl">
          <v-toolbar color="toolbar">
            <v-toolbar-title>Account</v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-row>
              <v-col sm="2">
                <v-img :src="getUserImage" :width="schoolPhotoSize"></v-img>
              </v-col>
              <v-col>
                <p>
                  Name:
                  <b>{{ user.userFullName }}</b
                  ><br />
                  {{ this.baseRole() }} ID (Username):
                  <b>{{ user.userSussiID }}</b
                  ><br />
                  Display Code: <b>{{ user.userDisplayCode }}</b
                  ><br />
                  <template v-if="$store.state.parent"
                    >Parent ID (SussiID):
                    <b>Configure parent linking in BetterCompass settings.</b
                    ><br
                  /></template>
                  <template v-if="user.userEmail">
                    Email: <b>{{ user.userEmail }}</b>
                    <br />
                  </template>
                  <template v-if="getStaff(user.userId)?.ce">
                    Staff Email: <b>{{ getStaff(user.userId).ce }}</b>
                    <br />
                  </template>
                  <template v-if="user.userDetails">
                    Age: <b>{{ user.userDetails }}</b
                    ><br />
                  </template>
                  <template
                    v-if="
                      parents.length && user.userId === $store.state.user.id
                    "
                  >
                    Parent(s):
                    <br />
                    <b>
                      <template v-for="parent in parents">
                        {{ parentLabel(parent) }}
                        <br :key="parent.id" />
                      </template>
                    </b>
                  </template>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-chip
                        color="indigo"
                        v-if="user.chroniclePinnedCount"
                        v-on="on"
                        >{{ user.chroniclePinnedCount }}</v-chip
                      >
                    </template>
                    <span> Pinned Chronicle Count </span>
                  </v-tooltip>
                  <br />
                  Today's Attendance:
                  <v-chip-group>
                    <v-tooltip
                      top
                      v-for="attendance in user.userTimeLinePeriods"
                      :key="attendance.id"
                    >
                      <template v-slot:activator="{ on }">
                        <span v-on="on">
                          <v-chip
                            pill
                            style="opacity: 1"
                            disabled
                            fab
                            :color="getAttendance(attendance.statusName).color"
                          >
                            <v-icon>
                              {{ getAttendance(attendance.statusName).icon }}
                            </v-icon>
                          </v-chip>
                        </span>
                      </template>
                      <span
                        >{{ attendance.name }}:
                        {{ attendance.statusName }}</span
                      >
                    </v-tooltip>
                  </v-chip-group>
                </p>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
        <v-card
          color="card"
          elevation="7"
          class="rounded-xl mt-3"
          v-if="extendedUser?.data?.medicalInformation?.length"
        >
          <v-toolbar color="toolbar">
            <v-toolbar-title>Medical Record</v-toolbar-title>
          </v-toolbar>
          <v-container
            v-for="medical in extendedUser.data.medicalInformation"
            :key="medical.id"
          >
            <strong>{{ medical.title }}</strong>
            <p>Regular Medication: {{ medical.regularMedication }}</p>
            <p>Symptoms: {{ medical.symptoms }}</p>
            <p>Description: {{ medical.description }}</p>
            <p style="white-space: pre-line; overflow-wrap: anywhere">
              Action: {{ medical.action }}
            </p>
          </v-container>
        </v-card>
      </v-col>
      <v-col>
        <v-card color="card" class="rounded-xl" elevation="7">
          <v-overlay :value="chronicle.loading" absolute>
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <v-toolbar color="toolbar">
            <v-toolbar-title>Chronicle</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-title>
              <v-select
                :items="chronicle.years"
                item-value="cycleIds"
                item-text="name"
                v-model="chronicle.year"
                solo
                hide-details
                single-line
                placeholder="Cycle"
              ></v-select>
            </v-toolbar-title>
          </v-toolbar>
          <v-container>
            <v-card color="card" class="mb-3 rounded-xl">
              <v-toolbar color="toolbar">
                <v-toolbar-title> Chronicle Summary </v-toolbar-title>
              </v-toolbar>
              <v-data-table
                :items="summaryRows"
                :headers="chronicle.summaryHeaders"
                :style="
                  'background-color: ' +
                  $vuetify.theme.themes[$vuetify.theme.dark ? 'dark' : 'light']
                    .card
                "
              >
                <template v-slot:item.categoryName="{ item }">
                  <v-icon
                    small
                    :color="tierColor(item.categoryName)"
                    class="mr-1"
                    >mdi-circle</v-icon
                  >{{ item.categoryName }}
                </template>
              </v-data-table>
            </v-card>
            <v-card
              color="card"
              v-for="item in chronicle.pinned"
              :key="item.id"
              class="mb-3 rounded-xl"
              :style="
                'border-left: 6px solid ' +
                tierColor(item.chronicleEntries[0].categoryName) +
                ' !important'
              "
            >
              <v-toolbar color="toolbar">
                <!-- Not a link: a student account can't view a staff member's
                     own dashboard (it requires staff auth), so this used to
                     just navigate to a page that loads forever. -->
                <v-avatar large class="mr-3">
                  <img
                    :src="
                      '/download/cdn/square/' +
                      getStaff(item.chronicleEntries[0].userIdCreator).pv +
                      '?compassInstance=' +
                      $store.state.school.instance
                    "
                  />
                </v-avatar>
                <v-toolbar-title>
                  {{ item.chronicleEntries[0].templateName }}
                  <v-chip
                    x-small
                    outlined
                    class="ml-2"
                    :color="tierColor(item.chronicleEntries[0].categoryName)"
                    v-if="item.chronicleEntries[0].categoryName"
                    >{{ item.chronicleEntries[0].categoryName }}</v-chip
                  >
                  <div class="subheading subtitle-1">
                    Recorded by:
                    <span>{{
                      getStaff(item.chronicleEntries[0].userIdCreator)?.n
                    }}</span
                    >, on
                    {{
                      $date(item.chronicleEntries[0].createdTimestamp).format(
                        "MMMM Do, YYYY"
                      )
                    }}
                  </div>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip
                  color="indigo"
                  class="mr-2"
                  @click="
                    chronicle.selected = item
                    chronicle.info = true
                  "
                  >Info</v-chip
                >
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <div v-on="on" v-bind="attrs">
                      <div v-on="on">
                        <v-chip
                          disabled
                          style="opacity: 1"
                          @click="
                            chronicle.selected = item
                            chronicle.info = true
                          "
                          ><v-icon small>mdi-pin-outline</v-icon></v-chip
                        >
                      </div>
                    </div>
                  </template>
                  <span v-if="item.chronicleEntries[0].attendees[0]?.pinExpiry">
                    This chronicle is pinned until:
                    {{
                      $date(
                        item.chronicleEntries[0].attendees[0]?.pinExpiry
                      ).format("MMMM Do YYYY")
                    }}) }}
                  </span>
                  <span v-else> This pin has no expiry </span>
                </v-tooltip>
              </v-toolbar>
              <v-container>
                <div
                  v-for="input in item.chronicleEntries[0].inputFields"
                  :key="input.id"
                >
                  <template v-if="JSONExtract(input.value).length">
                    {{ getJSON(input.value) }}
                  </template>
                  <template v-else>
                    {{ input.value }}
                  </template>
                </div>
              </v-container>
            </v-card>
            <v-card
              color="card"
              v-for="item in chronicle.items"
              :key="item.id"
              class="mb-3 rounded-xl"
              :style="
                'border-left: 6px solid ' +
                tierColor(item.chronicleEntries[0].categoryName) +
                ' !important'
              "
            >
              <v-toolbar color="toolbar">
                <!-- Not a link: a student account can't view a staff member's
                     own dashboard (it requires staff auth), so this used to
                     just navigate to a page that loads forever. -->
                <v-avatar large class="mr-3">
                  <img
                    :src="
                      '/download/cdn/square/' +
                      getStaff(item.chronicleEntries[0].userIdCreator).pv +
                      '?compassInstance=' +
                      $store.state.school.instance
                    "
                  />
                </v-avatar>
                <v-toolbar-title>
                  {{ item.chronicleEntries[0].templateName }}
                  <v-chip
                    x-small
                    outlined
                    class="ml-2"
                    :color="tierColor(item.chronicleEntries[0].categoryName)"
                    v-if="item.chronicleEntries[0].categoryName"
                    >{{ item.chronicleEntries[0].categoryName }}</v-chip
                  >
                  <div class="subheading subtitle-1">
                    Recorded by:
                    <span>{{
                      getStaff(item.chronicleEntries[0].userIdCreator)?.n
                    }}</span
                    >, on
                    {{
                      $date(item.chronicleEntries[0].createdTimestamp).format(
                        "MMMM Do, YYYY"
                      )
                    }}
                  </div>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-chip
                  color="indigo"
                  @click="
                    chronicle.selected = item
                    chronicle.info = true
                  "
                  >Info</v-chip
                >
              </v-toolbar>
              <v-container>
                <div
                  v-for="input in item.chronicleEntries[0].inputFields"
                  :key="input.id"
                >
                  <template v-if="JSONExtract(input.value).length">
                    {{ getJSON(input.value) }}
                  </template>
                  <template v-else>
                    {{ input.value }}
                  </template>
                </div>
              </v-container>
            </v-card>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import JSONExtract from "@/lib/jsonExtract"
import { chronicleList, pinnedChronicles, safeChronicleJson, tierColor as tierColorFn } from "@/lib/chronicle"

export default {
  name: "UserDashboard",
  props: ["user", "extendedUser"],
  data() {
    return {
      // Compass's own "GetChronicleRatings" reference list - a "traffic
      // light" rating some chronicle entries carry (e.g. a behaviour entry
      // marked Green/Amber/Red). Keyed by enumValue -> name, fetched once.
      chronicleRatings: {},
      chronicle: {
        // Compass's own "GetSummaryByUserId" leaves out categories it doesn't mark
        // summaryVisibleStudent (e.g. Communication logs) - officialSummary holds
        // that restricted list, while allItems holds every entry we can see so the
        // summaryRows computed property below can build a complete breakdown.
        officialSummary: [],
        allItems: [],
        summaryHeaders: [
          {
            text: "Name",
            value: "categoryName"
          },
          {
            text: "Total Points",
            value: "totalPoints"
          },
          {
            text: this.$date().year(),
            value: "yearCount"
          },
          {
            text: "Total",
            value: "totalCount"
          }
        ],
        loading: true,
        loadingPinned: true,
        pinned: [],
        users: [],
        years: [],
        info: false,
        year: this.$date().year(),
        selected: null,
        offset: 0,
        period: 32,
        page: 1,
        items: []
      },
      parents: []
    }
  },
  computed: {
    getUserImage() {
      // Always the real Compass school photo here - the custom avatar
      // (BetterCompass Settings > Customization) is a separate thing shown
      // elsewhere (header, discussions, etc.), and shouldn't override this.
      return this.$store.state.school.fqdn + this.user.userPhotoPath
    },
    schoolPhotoSize() {
      return this.$store.state.user.bcUser?.schoolPhotoSize || 200
    },
    // Compass's official summary endpoint silently drops any category that isn't
    // marked "summaryVisibleStudent" server-side (Communication logs included),
    // even on the real Compass site. We already have every entry Compass sent us
    // (chronicle.allItems, same data the entries list is built from), so build a
    // complete per-category breakdown from that instead of trusting the
    // restricted endpoint alone. Official totalPoints/useForAggregatedPoints are
    // kept where Compass does provide them; everything else is counted locally.
    summaryRows() {
      const rows = new Map()
      this.chronicle.allItems.forEach((item) => {
        const entry = item.chronicleEntries && item.chronicleEntries[0]
        if (!entry) return
        const name = entry.categoryName || "Uncategorised"
        if (!rows.has(name)) {
          rows.set(name, {
            categoryName: name,
            totalCount: 0,
            yearCount: 0,
            totalPoints: 0,
            useForAggregatedPoints: false
          })
        }
        const row = rows.get(name)
        row.totalCount += 1
        row.totalPoints += typeof entry.points === "number" ? entry.points : 0
        const year = entry.occurredTimestamp
          ? this.$date(entry.occurredTimestamp).year()
          : null
        if (year === this.chronicle.year) row.yearCount += 1
      })
      this.chronicle.officialSummary.forEach((official) => {
        const row = rows.get(official.categoryName)
        if (row) {
          row.totalPoints = official.totalPoints
          row.useForAggregatedPoints = official.useForAggregatedPoints
        }
      })
      return [...rows.values()].sort((a, b) => b.yearCount - a.yearCount)
    }
  },
  methods: {
    parentLabel(parent) {
      // Compass already puts the code in the name ("Jane Smith - JSMI12"),
      // so only add it when it is not there.
      const name = String(parent.name || "").trim()
      const code = String(parent.importIdentifier || "").trim()
      const shown = code && !name.includes(code) ? name + " - " + code : name
      return shown + " (" + parent.id + ")"
    },
    getParents() {
      if (this.user.userId === this.$store.state.user.id) {
        this.axios
          .post(
            "/Services/Communications.svc/GetEmailRecipientsAndParentRecipientsByStudents",
            {
              userIds: [this.user.userId || this.$store.state.user.userId],
              activityId: null,
              subjectUserId: this.user.userId || this.$store.state.user.userId,
              startDate: "",
              endDate: ""
            }
          )
          .then((res) => {
            this.parents = res.data.d
          })
      }
    },
    getParentSummary() {
      this.axios
        .post("/Services/ChronicleV2.svc/GetSummaryByUserId", {
          targetUserId: this.user.userId || this.$store.state.user.userId
        })
        .then((res) => {
          this.chronicle.officialSummary = Array.isArray(res.data.d) ? res.data.d : []
        })
        .catch((e) => {
          console.error("BCX chronicle summary:", e)
        })
    },
    baseRole() {
      const userBaseRole = [
        "Guest",
        "Student",
        "Staff",
        "Parent",
        "Admin",
        "Visitor",
        "Not Authenticated"
      ]
      return userBaseRole[this.user.userRole || 6]
    },
    getStaff(id) {
      const user = this.chronicle.users.find((staff) => staff.id === id)
      if (user && user.n) return user
      if (!this._staffPending) this._staffPending = new Set()
      if (!this._staffPending.has(id)) {
        this._staffPending.add(id)
        this.axios
          .post("/Services/User.svc/GetUserDetailsBlobByUserId", {
            userId: this.$store.state.user.userId,
            targetUserId: id
          })
          .then((response) => {
            const d = response.data && response.data.d
            this.chronicle.users.push({
              id,
              n: (d && d.userFullName) || "Staff",
              pv:
                (d &&
                  d.userSquarePhotoPath &&
                  d.userSquarePhotoPath.replace("/download/cdn/square/", "")) ||
                "nopic",
              status: d && d.userStatus
            })
          })
          .catch((e) => {
            console.error("BCX staff lookup:", id, e)
            this.chronicle.users.push({ id, n: "Staff", pv: "nopic", status: null })
          })
      }
      // While the lookup is in flight (or if it never resolves), return a safe
      // placeholder so the template never dereferences undefined.
      return { id, n: "Staff", pv: "nopic", status: null }
    },
    getAllStaff() {
      this.axios
        .post("/Services/User.svc/GetAllStaff", {
          start: 0
        })
        .then((res) => {
          this.chronicle.users = res.data.d
        })
    },
    generateYears() {
      const currentYear = this.$date().year()
      for (let i = 2016; i <= currentYear; i++) {
        this.chronicle.years.push(i)
      }
    },
    getAttendance(attendanceStatus) {
      if (attendanceStatus === "Present") {
        return {
          color: "green",
          icon: "mdi-check"
        }
      } else if (attendanceStatus === "Not Present") {
        return {
          color: "red",
          icon: "mdi-close"
        }
      } else if (attendanceStatus === "Medical/Illness") {
        return {
          color: "red",
          icon: "mdi-close"
        }
      } else if (
        attendanceStatus === "Late" ||
        attendanceStatus === "Late Un'd"
      ) {
        return {
          color: "orange",
          icon: "mdi-clock"
        }
      } else {
        return {
          color: "grey",
          icon: "mdi-help"
        }
      }
    },
    JSONExtract(str) {
      return JSONExtract(str)
    },
    getAllChronicles() {
      this.chronicle.loadingPinned = true
      this.axios
        .post("/Services/ChronicleV2.svc/GetUserChronicleFeedThin", {
          targetUserId: this.$route.params.id || this.$store.state.user?.userId,
          start: this.chronicle.offset,
          startDate: this.$date("01-01-2016").startOf("year").format(),
          endDate: this.$date().endOf("year").format(),
          pageSize: 10000,
          filterCategoryIds: [-1],
          asParent: false,
          sortOrder: 0
        })
        .then((res) => {
          const full = chronicleList(res)
          // find all in res.data.d.data that have chronicleEntries[0].attendees[0].pinToProfile
          this.chronicle.pinned = pinnedChronicles(full, this.$date)
          this.chronicle.allItems = full
          this.chronicle.loadingPinned = false
        })
        .catch((e) => {
          console.error("BCX chronicle (pinned):", e)
          this.$toast.error("Failed to load pinned chronicles.")
          this.chronicle.loadingPinned = false
        })
    },
    getChronicle() {
      this.chronicle.loading = true
      this.axios
        .post("/Services/ChronicleV2.svc/GetUserChronicleFeedThin", {
          targetUserId: this.$route.params.id || this.$store.state.user?.userId,
          start: this.chronicle.offset,
          // Was capped at 43 with no pagination to fetch more - a student
          // with more entries than that in a year silently had the rest cut
          // off. There's no "load more" here, so just ask for effectively
          // everything in the selected year, same as the pinned-items fetch
          // (getAllChronicles) already does.
          pageSize: 10000,
          startDate: this.$date("01-01-" + this.chronicle.year)
            .startOf("year")
            .format(),
          endDate: this.$date("01-01-" + this.chronicle.year)
            .endOf("year")
            .format(),
          filterCategoryIds: [-1],
          asParent: false,
          sortOrder: 0
        })
        .then((res) => {
          this.chronicle.items = chronicleList(res)
          this.chronicle.loading = false
        })
        .catch((e) => {
          console.error("BCX chronicle:", e)
          this.$toast.error("Failed to load chronicles.")
          this.chronicle.loading = false
        })
    },
    getJSON(json) {
      return safeChronicleJson(json)
    },
    // Named imports aren't reachable by their bare name from inside <template>
    // in this build - calling tierColor(...) directly in the template throws
    // "tierColor is not a function" (confirmed in a real browser), so it's
    // wrapped as an instance method here instead, same as recipientCount().
    tierColor(categoryName) {
      return tierColorFn(categoryName)
    },
    // Compass's attendeeNames field joins names with a literal "<br>" string.
    // (Note: that string can never be written directly in this component's
    // <template> block - a literal "<" there gets parsed as the start of an
    // HTML tag and silently breaks the surrounding {{ }} interpolation, which
    // is why this lives here instead.)
    recipientCount(entry) {
      if (!entry || typeof entry.attendeeNames !== "string") return 0
      return entry.attendeeNames.split("<br>").filter((n) => n.trim()).length
    },
    recipientNames(entry) {
      if (!entry || typeof entry.attendeeNames !== "string") return []
      return entry.attendeeNames
        .split("<br>")
        .map((n) => n.trim())
        .filter((n) => n)
    },
    getChronicleRatings() {
      this.axios
        .get("/Services/ReferenceDataCache.svc/GetChronicleRatings")
        .then((res) => {
          const map = {}
          ;(res.data.d || []).forEach((r) => {
            map[r.enumValue] = r.name
          })
          this.chronicleRatings = map
        })
        .catch(() => {
          /* no ratings reference data available - rating chip just won't show */
        })
    },
    chronicleRatingLabel(rating) {
      return this.chronicleRatings[rating] || null
    },
    chronicleRatingColor(rating) {
      // Compass's own rating names are literally color names (Green/Amber/
      // Red/Grey) - map them straight to a chip color instead of guessing.
      const label = this.chronicleRatingLabel(rating)
      if (!label) return undefined
      const known = ["green", "amber", "red", "grey", "gray"]
      return known.includes(label.toLowerCase()) ? label.toLowerCase() : undefined
    }
  },
  mounted() {
    this.getAllStaff()
    this.generateYears()
    this.getChronicle()
    this.getAllChronicles()
    this.getParentSummary()
    this.getParents()
    this.getChronicleRatings()
  },
  watch: {
    "chronicle.year"() {
      this.getChronicle()
    }
  }
}
</script>

<style scoped></style>
