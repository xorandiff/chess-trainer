<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { MOVE_MARK, PIECE_COLOR } from "@/enums";
import { useBoardStore } from "@/stores/board";

import BookIcon from "@/components/icons/BookIcon.vue";
import BrilliantMoveIcon from "@/components/icons/BrilliantMoveIcon.vue";
import GreatMoveIcon from "@/components/icons/GreatMoveIcon.vue";
import BestMoveIcon from "@/components/icons/BestMoveIcon.vue";
import ExcellentMoveIcon from "@/components/icons/ExcellentMoveIcon.vue";
import GoodMoveIcon from "@/components/icons/GoodMoveIcon.vue";
import InaccuracyIcon from "@/components/icons/InaccuracyIcon.vue";
import MistakeIcon from "@/components/icons/MistakeIcon.vue";
import BlunderIcon from "@/components/icons/BlunderIcon.vue";

const store = useBoardStore();

const { markTypeCount } = storeToRefs(store);
</script>

<template>
   <a-space direction="vertical" style="width: 100%">
      <a-row :gutter="8">
         <a-col :span="12">
            <a-card>
               <a-statistic
                  title="White accuracy"
                  :value="11.28"
                  :precision="2"
                  suffix="%"
                  style="margin-right: 50px"
               >
               </a-statistic>
            </a-card>
         </a-col>
         <a-col :span="12">
            <a-card>
               <a-statistic
                  title="Black accuracy"
                  :value="9.3"
                  :precision="2"
                  suffix="%"
               >
               </a-statistic>
            </a-card>
         </a-col>
      </a-row>
      <a-card id="reportSummary">
         <a-row class="colorBrilliant" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.BRILLIANT, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><BrilliantMoveIcon :size="12" /> Brilliant</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.BRILLIANT, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorGreatMove" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.GREAT_MOVE, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><GreatMoveIcon :size="12" /> Great Move</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.GREAT_MOVE, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorBestMove" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.BEST_MOVE, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><BestMoveIcon :size="12" /> Best Move</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.BEST_MOVE, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorExcellent" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.EXCELLENT, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><ExcellentMoveIcon :size="12" /> Excellent</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.EXCELLENT, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorGood" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.GOOD, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><GoodMoveIcon :size="12" /> Good</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.GOOD, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorBook" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.BOOK, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><BookIcon :size="12" /> Book</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.BOOK, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorInaccuracy" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.INACCURACY, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><InaccuracyIcon :size="12" /> Inaccuracy</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.INACCURACY, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorMistake" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.MISTAKE, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><MistakeIcon :size="12" /> Mistake</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.MISTAKE, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorBlunder" style="text-align: center">
            <a-col :span="4" :offset="6">{{ markTypeCount(MOVE_MARK.BLUNDER, PIECE_COLOR.WHITE) }}</a-col>
            <a-col :span="4"><BlunderIcon :size="12" /> Blunder</a-col>
            <a-col :span="4">{{ markTypeCount(MOVE_MARK.BLUNDER, PIECE_COLOR.BLACK) }}</a-col>
         </a-row>
         <a-row class="colorMissedWin" style="text-align: center">
            <a-col :span="4" :offset="6">-</a-col>
            <a-col :span="4">Missed Win</a-col>
            <a-col :span="4">-</a-col>
         </a-row>
      </a-card>
   </a-space>
</template>