<template>
  <div>
    <v-container>
      <v-card color="card" class="rounded-xl" elevation="7">
        <v-toolbar color="toolbar">
          <v-toolbar-title>BetterCompass Changelog</v-toolbar-title>
        </v-toolbar>
        <v-container>
          <v-card-title> v2.0.0 (local fork) </v-card-title>
          <ul>
            <li>
              Auto-update. Every time you open BetterCompass the extension
              looks at this fork's latest release on GitHub. If it is newer,
              it downloads it and shows a "ready - click to reload" button.
              After that you are on the new version, with no reinstalling.
              If GitHub cannot be reached, or a downloaded version fails to
              start, the copy that came with the extension is used.
            </li>
            <li>
              Fonts. Settings &gt; Customization &gt; Fonts lets you pick a
              font for the whole app and a different one for headings, the
              sidebar, buttons and tabs, the calendar, tables and text
              boxes. You can change the text size, type the name of any font
              installed on your computer, or upload a font file.
            </li>
            <li>
              About page: shows which version is running and has a "Check
              for updates now" button.
            </li>
          </ul>
        </v-container>
        <v-container>
          <v-card-title> v1.9.0 (local fork) </v-card-title>
          <ul>
            <li>
              Removed the "self-update" loader added in v1.5.0 - v1.8.0. It
              never worked in a real browser: Chrome does not let an
              extension like this one run code it has downloaded, so those
              versions could not start at all. BetterCompass loads directly
              from the installed extension again, as it did up to v1.4.0.
            </li>
            <li>
              Removed the password screen and the one-account lock that were
              briefly added in those versions.
            </li>
            <li>
              The GitHub icon still shows a dot when a newer version has been
              published. Updating is still a manual download and reload.
            </li>
            <li>This changelog is now organized by version instead of by date.</li>
          </ul>
        </v-container>
        <v-container>
          <v-card-title> v1.4.0 (local fork) </v-card-title>
          <ul>
            <li>
              Added a GitHub icon in the top bar linking to the source code
              for this fork, with a small dot that lights up when a newer
              version has been published.
            </li>
          </ul>
        </v-container>
        <v-container>
          <v-card-title> v1.3.0 (local fork) </v-card-title>
          <ul>
            <li>
              Fixed Chronicle silently cutting off at 43 entries for the
              year, regardless of how many more you actually had - it now
              fetches effectively all of them.
            </li>
            <li>
              Chronicle entries now show their Points and a
              Green/Amber/Red/Grey rating when Compass provides them.
            </li>
            <li>
              Fixed the Teacher section of a class page (which shows who's
              covering a substituted class) sometimes taking ages to appear,
              or not appearing until you clicked something else on the page.
              Three separate bugs: the page waited on a slow, unrelated
              header image before showing anything at all; the teacher's
              details were being fetched a second time, needlessly, instead
              of reusing a request already in flight; and the actual display
              update wasn't registered correctly, so it only ever showed up
              as a side effect of something else refreshing the page.
            </li>
          </ul>
        </v-container>
        <v-container>
          <v-card-title> v1.2.0 &ndash; v1.2.3 (local fork) </v-card-title>
          <ul>
            <li>
              Removed the "Go to Route" tool from the navigation drawer - it
              was redundant with normal URL navigation.
            </li>
            <li>
              Removed the "Provide Feedback" email feature entirely.
            </li>
            <li>
              Added a Customization section to BetterCompass Settings: upload
              your own profile picture, and upload a custom background image
              for the whole app with adjustable dim and blur. Both are stored
              only on this device.
            </li>
            <li>
              Your real school photo on the Account dashboard is no longer
              replaced by a custom profile picture - it now just has its own
              resizable size setting (capped at 200, since Compass's photo
              doesn't actually get sharper past that).
            </li>
            <li>
              Teacher names/photos (on a class page, in Chronicle, in News,
              and in the Staff list) are no longer clickable - clicking them
              tried to open a staff member's own dashboard, which a student
              account isn't allowed to see and would just load forever.
            </li>
            <li>
              Chronicle entries now show who the actual recipients are, not
              just a count.
            </li>
          </ul>
        </v-container>
        <v-container>
          <v-card-title> v1.1.x and earlier (local fork) </v-card-title>
          <ul>
            <li>
              Fixed the Chronicle feed crashing/failing to load (bad request
              flags, a dead summary endpoint, and a crash when looking up
              staff info).
            </li>
            <li>
              Fixed the Chronicle Info dialog showing a garbled wall of raw
              template text instead of the recipient count.
            </li>
            <li>
              Chronicle entries are now color-coded by tier (green for
              merits/positive entries, grey for low, amber for medium, red
              for high) and show their category as a chip.
            </li>
            <li>
              Fixed calendar events always showing the same color regardless
              of type - genuine Events now show green, substitute
              teacher/moved room classes show pink/red, and normal classes
              show blue, matching what Compass itself sends.
            </li>
            <li>
              Normal class events now use Compass's own pale blue
              (<code>#dce6f4</code>) with darker blue text for readability.
            </li>
            <li>
              Renamed "Relief" to "Substitute Teacher" throughout (including
              the on-screen tag and the theme color picker), and fixed its
              color to match Compass's own.
            </li>
            <li>
              Fixed class titles showing the subject name twice (eg. "Human
              Society & Its Environment (HSIE)") on the homepage, the class
              schedule page, and the offline calendar cache.
            </li>
            <li>
              Fixed Subjects & Classes permanently stuck loading, both from a
              dead Compass endpoint and a race condition when it was the
              first page loaded.
            </li>
            <li>
              Fixed downloading Reports always failing with "file not found"
              - Compass requires generating the report first (a short
              background job) before it can be downloaded, which is now
              handled automatically with a loading spinner on the download
              button.
            </li>
            <li>
              The Reports list and Progress Reports no longer get stuck
              waiting on each other - each loads independently, and a clear
              message is shown when there are no active progress report
              cycles instead of a silent failure.
            </li>
            <li>
              Removed the School Subjects and School Classes pages - the
              Compass endpoints behind them require staff access and always
              fail for a student account.
            </li>
          </ul>

          <v-divider class="my-4"></v-divider>
          <p class="text-center" style="opacity: 0.6">
            Below this point: the original BetterCompass project's history,
            from before this fork existed - kept by date, since there's no
            fork version number to attach it to.
          </p>

          <v-card-title> 08/04/2022 - 28/04/2022 </v-card-title>
          <ul>
            <li>
              Upcoming Events now shows the proper content description, and
              title.
            </li>
            <li>
              Improved the theme editor to allow for custom colors, and a hex
              input.
            </li>
            <li>Improved login flow & registration.</li>
            <li>
              Fixed bug where new users would have a default preset of no
              calendars enabled, if you still cannot see your calendars, click
              the Settings icon on the calendar and enable all.
            </li>
            <li>
              You can now select what particular calendars show on your homepage
              calendar with the cog/settings icon located on the calendar card
              which replaces minimize header events.
            </li>
            <li>
              You can now customize your homepage/dashboard with the use of
              widgets that you can add, remove, and move.
            </li>
            <li>
              The calendar is cached to the state to avoid unnecessary reloading
              of the calendar after page initialization.
            </li>
            <li>
              The calendar (2 weeks) and some user data now gets stored locally
              so BetterCompass can be used offline in a limited fashion on the
              PWA app.
            </li>
            <li>
              You can now navigate the calendar on the homepage with the arrow
              keys.
            </li>
            <li>
              The progression report graph no longer appears on mobile, and the
              colors will not be the same for multiple classes.
            </li>
            <li>
              You can now expand the calendar view to make it easier to see the
              weekly view on lower resolution devices.
            </li>
            <li>You can now view what staff attend your school.</li>
            <li>
              There is now a learning task widget so you can view relevant
              learning tasks, and submit them if pending/overdue.
            </li>
            <li>
              Using the learning task dialog, you can now see the creation date
              of the learning task.
            </li>
            <li>
              You can see learning task submissions as a parent, or when the
              learning task would otherwise be in an "expired" or disabled
              state, also applies for feedback.
            </li>
            <li>
              You can now change the profile picture shown on your profile (only
              visible to you).
            </li>
            <li>
              The icon in the top right corner now shows your profile picture,
              this may encourage you to change it.
            </li>
            <li>
              Fixed BetterCompass bug where the Learning Tasks do not show a due
              date.
            </li>
            <li>
              Fixed a bug where events that should be shown as a header event,
              were shown as a normal event.
            </li>
            <li>
              Fixed bug where header events extending longer than a day wouldn't
              continue to the next day.
            </li>
            <li>
              Adding a task to an unknown activity will no longer break tasks.
            </li>
            <li>
              You can now hide tasks that are irrelevant (older than 10 weeks if
              pending, or 2 weeks if submitted).
            </li>
            <li>
              Rows per page on tables throughout BetterCompass now persist.
            </li>
            <li>
              Attendance calendar now shows the AM/PM status when you hover over
              it.
            </li>
            <li>
              The chronicle no longer infinitely loads when viewing a staff
              account when you do not have access to view it.
            </li>
            <li>
              The learning task results no longer include irrelevant grading
              scheme options.
            </li>
            <li>
              Fixed an inconsistency in the homepage where the spacing was
              different at the top of the screen.
            </li>
            <li>
              Redesigned news widget to match the chronicles feed to improve on
              consistency.
            </li>
            <li>Cards now have toolbars to improve consistency.</li>
            <li>More optimizations to make BetterCompass more consistent.</li>
            <li>Fixed progress reports infinite load due to graph.</li>
            <li>
              You can now log-out of BetterCompass using the account dropdown
              menu in the navigation bar.
            </li>
            <li>There is now a bookmarks widget.</li>
            <li>There is now a chronicles widget.</li>
            <li>
              Fixed a bug where you couldn't update tasks that don't have a due
              date.
            </li>
            <li>Redesigned the subject/class roll to match the other pages.</li>
            <li>
              You can now change your academic group (year) for learning tasks.
            </li>
            <li>Hidden tasks are now always shown for learning tasks.</li>
            <li>
              You can now see your school's subjects and respective classes that
              run for the subjects on the School Subjects page.
            </li>
            <li>You can now see your Chronicle Summary.</li>
            <li>You can now see CompassIdentity card information.</li>
            <li>Additional Performance & Bug fixes.</li>
          </ul>

          <v-card-title> 07/04/2022 </v-card-title>
          <ul>
            <li>Fixed rubric not showing teacher results.</li>
            <li>Fixed missing rubric tab on User Learning Tasks.</li>
            <li>
              Added rubric learning task tag, and Compass tags (Assessment,
              Assignment, etc).
            </li>
            <li>Added past events to User Events.</li>
            <li>Added event resources to User Events.</li>
            <li>Event descriptions are now sanitized.</li>
          </ul>

          <v-card-title> 06/04/2022 </v-card-title>
          <ul>
            <li>
              BetterCompass now has most, if not all of the student features
              added.
            </li>
            <li>
              You can now see the Rubric for Learning Tasks (in dedicated tab).
            </li>
            <li>
              Pinned chronicles will now be pinned (bypasses year selection,
              unless the pin has expired), BetterCompass Exclusive.
            </li>
            <li>You can now see the creation date of the chronicle.</li>
            <li>
              The chronicles section will now show a loading spinner when
              loading.
            </li>
          </ul>

          <v-card-title> 05/04/2022 </v-card-title>
          <ul>
            <li>BetterCompass is now considered stable!</li>
            <li>Improved QuickSwitch activation responsiveness.</li>
            <li>You can now select a year for user chronicles.</li>
            <li>
              You can now see the correct staff name, and avatar for the
              associated chronicle (including inactive staff members,
              BetterCompass Exclusive).
            </li>
            <li>
              You can now view your teacher's profile by clicking on their name
              on the class/subject page.
            </li>
            <li>
              The profile page now handles user status properly (will now show
              Left, Inactive, etc if applicable instead of Active).
            </li>
            <li>
              The profile page will now display the relevant staff email if
              applicable.
            </li>
            <li>
              You can now view your teacher's profile by clicking on their name
              on a chronicle entry.
            </li>
          </ul>

          <v-card-title> 04/04/2022 </v-card-title>
          <ul>
            <li>Fixed URL link submissions in Learning Tasks.</li>
            <li>
              When submitting an item to a learning task, it will automatically
              refresh to display it without requiring a refresh.
            </li>
            <li>Added missing learning task status codes.</li>
            <li>Added BetterCompass about page.</li>
          </ul>

          <v-card-title> 02/04/2022 - 03/04/2022</v-card-title>
          <ul>
            <li>
              BetterCompass is now
              <a href="https://github.com/Troplo/BetterCompass"> open source</a
              >, licensed under GNU General Public License V3.
            </li>
            <li>
              Progress Reports now has a chart that corresponds to the selected
              cycle (BetterCompass Exclusive).
            </li>
            <li>Due date is now shown on the learning tasks table.</li>
            <li>
              Subject and Activity is now shown on the User Profile Learning
              Tasks table. (Now sorted by activity by default)
            </li>
            <li>
              You can now see your class attendance record per class on the
              Attendance tab.
            </li>
            <li>
              You can now view child profiles, and your personal user profile
              with a Parent account.
            </li>
            <li>
              Reports, Attendance, etc now correspond to the child profile.
            </li>
            <li>
              Updated profile route scheme to /user/:id/:tab from /user/:tab.
            </li>
            <li>
              User Flags are now shown as red banners on the User Profile
              (Parent only).
            </li>
            <li>
              Clicking on the learning task notification warning will take you
              to Learning Tasks.
            </li>
            <li>
              Fixed bug where the Learning Task description would always be null
              on the User Profile Learning Tasks.
            </li>
            <li>Fixed login validation error.</li>
            <li>Fixed & Improved Calendar AutoJump.</li>
            <li>You can now submit URL links in Learning Tasks.</li>
            <li>You can now see your per term attendance.</li>
            <li>
              The BetterCompass gradient will appear again on the title if there
              is no set accent color.
            </li>
          </ul>

          <v-card-title> 30/03/2022 </v-card-title>
          <ul>
            <li>
              An alternate domain, bettercompass.com.au can be used to access
              BetterCompass if you wish.
            </li>
            <li>
              Compass-compatible Activity Discussions will not be added to
              BetterCompass.
            </li>
            <li>Attendance calendar has been added to Your Profile.</li>
            <li>Performance & Bug fixes.</li>
          </ul>

          <v-card-title> 29/03/2022 </v-card-title>
          <ul>
            <li>You can now see Analytics in your profile.</li>
            <li>
              You can now see your true score for Learning Tasks. (eg. Excellent
              (8/8))
            </li>
            <li>Fixed bug where you couldn't see progress reports.</li>
            <li>Fixed double-loading calendar bug.</li>
            <li>Fixed missing loading spinner on page initialization.</li>
          </ul>

          <v-card-title> 28/03/2022 </v-card-title>
          <ul>
            <li>
              There is a new guided setup wizard for new BetterCompass users.
            </li>
            <li>
              The calendar day persists if you were to go back to Home after
              navigating away.
            </li>
            <li>Progress Reports have been added.</li>
            <li>The calendar now has columns for overlapping events.</li>
            <li>
              The minimize calendar events feature now permits blue events.
            </li>
            <li>
              The QuickSwitcher now has the subject short-code (eg. Year 11
              Computing (11COM11))
            </li>
            <li>You can use existing theme presets to create a new theme.</li>
            <li>The attendance now registers "Late Un'd" as Late.</li>
            <li>You can now randomize a theme with the theme creator.</li>
          </ul>

          <v-card-title> 25/03/2022 - 27/03/2022 </v-card-title>
          <ul>
            <li>
              Themes, there are now a few theme presets to choose from, some
              include Classic, Grey, and AMOLED (Dark)
            </li>
            <li>
              You can now make your own themes by changing the defined colors to
              your liking
            </li>
            <li>
              You can now choose the accent/primary color of your choosing
              without creating an entire new theme.
            </li>
            <li>
              Themes will synchronize throughout all devices, including your
              preferred theme.
            </li>
            <li>
              Calendar Auto Jumping, the calendar will now skip to Monday if on
              a weekend (can be disabled in Settings).
            </li>
            <li>Significantly reduced bundle size.</li>
            <li>
              Settings now has its own dedicated page as a User Profile tab.
            </li>
            <li>
              All ugly styles are removed from lesson plans, including in
              Resources.
            </li>
            <li>
              The calendar is now much faster by preloading a week before, and
              in advance which will defeat the need for loading.
            </li>
            <li>
              There is now a banner shown when there is a BetterCompass update
              available.
            </li>
            <li>Settings now synchronize throughout all devices.</li>
          </ul>

          <v-card-title> 24/03/2022 </v-card-title>
          <ul>
            <li>
              Fixed major issue where the main thread would freeze from 4
              seconds to crashing the entire browser when loading BetterCompass.
              More details can be found on
              <a href="https://github.com/vuetifyjs/vuetify/issues/14864">
                this issue</a
              >.
            </li>
            <li>You can now press ENTER to submit the login form.</li>
            <li>
              Relief/substitute teachers no longer show unparsed HTML code on
              the calendar.
            </li>
          </ul>

          <v-card-title> 23/03/2022 </v-card-title>
          <ul>
            <li>
              Tasks, you can now, create, view, and edit normal Compass tasks.
            </li>
            <li>
              Rich Notes, rich notes are an enhanced version of standard tasks
              that allow you to add descriptions, they cannot be viewed in
              normal Compass.
            </li>
            <li>
              Class Notes, using rich notes, you can now create notes that are
              specific to a class.
            </li>
            <li>You can now see your upcoming events on the dashboard.</li>
            <li>
              You can now minimize header activities to only show learning tasks
              and your current school week (if your school supports it), enable
              in BetterCompass Settings.
            </li>
            <li>
              Removed redundant day text and button from calendar on the daily
              schedule mode.
            </li>
            <li>You can now download attachments from School News.</li>
            <li>
              Lesson plans are now sanitized to avoid XSS (albeit an extremely
              unlikely occurrence), and other uglifying styles.
            </li>
          </ul>

          <v-card-title> 22/03/2022 </v-card-title>
          <ul>
            <li>Added activity resources.</li>
            <li>Added school resources.</li>
            <li>Fixed weather widget.</li>
            <li>Updated dark theme color scheme.</li>
            <li>Made light theme slightly more tolerable.</li>
            <li>
              Added "Provide Feedback" button on the sidebar to report
              bugs/suggest features.
            </li>
            <li>Added school events.</li>
            <li>Removed parent options on User Profile page.</li>
            <li>Added semester reports.</li>
            <li>Remove unparsed JSON from chronicle.</li>
            <li>
              Added actual routes to QuickSwitch, like User Profile, in addition
              to the existing subjects.
            </li>
          </ul>

          <v-card-title> 21/03/2022 </v-card-title>
          <ul>
            <li>Fixed the dark sidebar on light theme.</li>
            <li>Removed white border around calendar.</li>
            <li>Added calendar refresh button (which also jumps to today).</li>
            <li>Added feedback tab to learning tasks.</li>
            <li>
              Compass links in learning tasks will be replaced with
              BetterCompass equivalents.
            </li>
            <li>Weekly schedule will exclude weekends.</li>
            <li>
              "Your Profile" now won't crash if you load it as the initial
              route.
            </li>
            <li>
              Learning task uploader now properly supports 2 or more upload
              types.
            </li>
            <li>Extra chronicle info has been moved to a dialog.</li>
            <li>The QuickSwitcher now clears the input automatically.</li>
            <li>
              The PWA app has been modified so the title-bar matches the
              background.
            </li>
            <li>The calendar now recognizes substitute teacher classes.</li>
            <li>You can now see what teacher you have on the activity.</li>
            <li>
              The activity instance will now automatically set itself upon
              QuickSwitch.
            </li>
            <li>
              You can now easily change between activity instances with arrows.
            </li>
            <li>
              There is now a weather widget built into BetterCompass. (Can be
              disabled in BetterCompass Settings)
            </li>
          </ul>
          <small
            >BetterCompass version {{ $store.state.versioning.version }}, built
            on {{ $store.state.versioning.date }}</small
          >
        </v-container>
      </v-card>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "Changelog"
}
</script>

<style scoped></style>
