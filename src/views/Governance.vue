<template>
  <div>
    <b-row class="match-height">
      <b-col
        v-for="p in proposals"
        :key="p.id"
        lg="6"
        md="12"
      >
        <b-card>
          <b-card-title
            class="mb-0"
          >
            #{{ p.id }}.
            <b-badge
              v-if="p.status == 1"
              pill
              variant="light-info"
              class="text-right"
            >
              Deposit
            </b-badge>
            <b-badge
              v-if="p.status == 2"
              pill
              variant="light-primary"
              class="text-right"
            >
              Voting
            </b-badge>
            <b-badge
              v-if="p.status == 3"
              pill
              variant="light-success"
              class="text-right"
            >
              Passed
            </b-badge>
            <b-badge
              v-if="p.status == 4"
              pill
              variant="light-danger"
              class="text-right"
            >
              Rejected
            </b-badge>
            <router-link
              :to="`./gov/${p.id}`"
            >
              {{ p.title }}
            </router-link></b-card-title>
          <b-card-body md="12">
            <div class="gov-wrapper d-flex flex-wrap">
              <div class="gov">
                <p class="card-text mb-25">
                  Start Date
                </p>
                <h6 class="mb-0">
                  {{ p.voting_start_time }}
                </h6>
              </div>
              <div class="gov">
                <p class="card-text mb-25">
                  End Date
                </p>
                <h6 class="mb-0">
                  {{ p.voting_end_time }}
                </h6>
              </div>
              <div class="gov">
                <p class="card-text mb-25">
                  Deposit
                </p>
                <h6 class="mb-0">
                  {{ p.total_deposit || '-' }}
                </h6>
              </div>
              <div class="gov">
                <p class="card-text mb-25">
                  Turnout
                </p>
                <h6 class="mb-0">
                  {{ p.tally.turnout }}%
                </h6>
              </div>
            </div>
          </b-card-body>

          <b-progress
            :max="100"
            height="2rem"
            class="mb-2"
            show-progress
          >
            <b-progress-bar
              :id="'vote-yes'+p.id"
              variant="success"
              :value="p.tally.yes"
              show-progress
            />
            <b-progress-bar
              :id="'vote-no'+p.id"
              variant="warning"
              :value="p.tally.no"
              show-progress
            />
            <b-progress-bar
              :id="'vote-veto'+p.id"
              variant="danger"
              :value="p.tally.veto"
              show-progress
            />
            <b-progress-bar
              :id="'vote-abstain'+p.id"
              variant="info"
              :value="p.tally.abstain"
              show-progress
            />
          </b-progress>
          <b-tooltip
            :target="'vote-yes'+p.id"
          >
            {{ p.tally.yes }}% voted Yes
          </b-tooltip>
          <b-tooltip
            :target="'vote-no'+p.id"
          >
            {{ p.tally.no }}% voted No
          </b-tooltip>
          <b-tooltip
            :target="'vote-veto'+p.id"
          >
            {{ p.tally.veto }}% voted No With Veta
          </b-tooltip>
          <b-tooltip
            :target="'vote-abstain'+p.id"
          >
            {{ p.tally.abstain }}% voted Abstain
          </b-tooltip>
          <b-card-footer class="pb-0">
            <router-link
              v-ripple.400="'rgba(113, 102, 240, 0.15)'"
              :to="`./gov/${p.id}`"
              variant="outline-primary"
            >
              <b-button
                v-ripple.400="'rgba(113, 102, 240, 0.15)'"
                :href="`./gov/${p.id}`"
                variant="outline-primary"
              >
                {{ $t('btn_detail') }}
              </b-button>
            </router-link>
            <b-button
              v-b-modal.vote-window
              :disabled="p.status!=2"
              variant="primary"
              class="btn float-right mg-2"
              @click="selectProposal(p.id, p.title)"
            >
              {{ $t('btn_vote') }}
            </b-button>
          </b-card-footer>
        </b-card>
      </b-col>
    </b-row>
    <operation-vote-component
      :proposal-id="selectedProposalId"
      :title="selectedTitle"
    />
  </div>
</template>

<script>
import {
  BCard, BCardTitle, BCardBody, BCardFooter, BButton, BProgressBar, BProgress, BBadge, BTooltip, BRow, BCol, VBModal,
} from 'bootstrap-vue'
import Ripple from 'vue-ripple-directive'
import { Proposal } from '@/libs/data'
import OperationVoteComponent from './OperationVoteComponent.vue'

export default {
  components: {
    BCard,
    BButton,
    BCardFooter,
    BProgressBar,
    BProgress,
    BBadge,
    BCardTitle,
    BTooltip,
    BCardBody,
    BRow,
    BCol,
    OperationVoteComponent,
  },
  directives: {
    'b-modal': VBModal,
    Ripple,
  },
  data() {
    return {
      selectedProposalId: 0,
      selectedTitle: '',
      proposals: [new Proposal()],
      max: 1,
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    selectProposal(pid, title) {
      this.selectedProposalId = Number(pid)
      this.selectedTitle = title
    },
    getList() {
      this.$http.getGovernanceList().then(res => {
        const voting = res.filter(i => i.status === 2)
        if (voting.length > 0) {
          let i = 0
          Promise.all(voting.reverse().map(p => this.$http.getGovernanceTally(p.id, p.tally.total))).then(update => {
            this.proposals.map(x => {
              if (x.status === 2) {
                const xh = x
                xh.tally = update[i]
                i += 1
                return xh
              }
              return x
            })
          })
        }
        this.proposals = res.reverse()
      })
    },
  },
}
</script>

<style scoped>
section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.card {
  flex-basis: 49%;
}
.gov-wrapper {
    display: flex;
    justify-content:center;
    align-items:center;
}
.dark-layout .gov-wrapper .gov {
    background-color: #161d31;
}
.gov-wrapper .gov {
    padding: .5rem;
    margin: .3rem;
    min-width: 8rem;
    text-align: center;
    background-color: #f8f8f8;
    border-radius: .357rem;
}

</style>
