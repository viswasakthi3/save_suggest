<template>
  <div class="dental-chart bg-gradient-to-br from-white to-slate-50 dark:from-gray-800 dark:to-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm ring-1 ring-slate-200/70 dark:ring-gray-700/60 w-full">
    <!-- Header -->
    <div class="flex items-start gap-3 mb-1">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-300 ring-1 ring-blue-100 dark:ring-blue-500/20">
        <Smile class="h-5 w-5" />
      </span>
      <div>
        <h3 class="text-lg font-semibold tracking-tight text-slate-800 dark:text-white">Dental Chart</h3>
        <p class="text-sm leading-snug text-slate-500 dark:text-slate-400">
          Click a tooth to view or add records. The
          <span class="font-medium text-slate-700 dark:text-slate-200">new condition</span> appears above each tooth and the
          <span class="font-medium text-slate-700 dark:text-slate-200">existing condition</span> below it.
        </p>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 mb-6 text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center gap-1.5">
        <span class="condition-pill condition-pill--new pill-blue">New</span>
        <span>Latest condition (above tooth)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="condition-pill condition-pill--old pill-slate">Previous</span>
        <span>Earlier condition (below tooth)</span>
      </div>
      <span class="hidden sm:block h-3.5 w-px bg-slate-200 dark:bg-gray-600"></span>
      <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-800"></span> Completed</div>
      <div class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-gray-800"></span> Pending</div>
    </div>

    <!-- Chart -->
    <div class="rounded-xl bg-slate-50/60 dark:bg-gray-900/40 ring-1 ring-slate-200/60 dark:ring-gray-700/50 p-4 sm:p-6 overflow-x-auto">
      <div class="relative min-w-[760px]">
        <!-- Jaw labels -->
        <span class="absolute -left-1 top-2 -rotate-90 origin-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">Upper</span>
        <span class="absolute -left-1 bottom-2 -rotate-90 origin-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">Lower</span>

        <!-- Quadrant dividing lines -->
        <div class="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-gray-600 transform -translate-y-1/2"></div>
        <div class="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-gray-600 transform -translate-x-1/2"></div>

        <!-- Upper jaw -->
        <div class="teeth-row">
          <div v-for="tooth in upperTeeth" :key="'upper-' + tooth" class="tooth-item">
            <ToothCell :tooth="tooth" />
          </div>
        </div>

        <!-- Lower jaw -->
        <div class="teeth-row mt-2">
          <div v-for="tooth in lowerTeeth" :key="'lower-' + tooth" class="tooth-item">
            <ToothCell :tooth="tooth" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Smile } from 'lucide-vue-next';
import { computed, reactive, h } from 'vue';

const props = defineProps({
  patientId: {
    type: [String, Number],
    required: true
  },
  records: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-record-for-tooth']);

const toothImageExists = reactive({});

// FDI tooth numbers laid out left-to-right as seen by the dentist
const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

[...upperTeeth, ...lowerTeeth].forEach((num) => {
  toothImageExists[num] = true;
});

const getToothImagePath = (toothNumber) => `/img/teeth/${toothNumber}.png`;

const imageError = (toothNumber) => {
  toothImageExists[toothNumber] = false;
};

const getIconForTooth = (toothNumber) => {
  const lastDigit = String(toothNumber).slice(-1);
  // Molars use the square icon, everything else the cross icon
  return ['6', '7', '8'].includes(lastDigit) ? '/img/teeth/square.jpeg' : '/img/teeth/cross.png';
};

// Build a chronological history of conditions for every tooth from the records.
const toothHistory = computed(() => {
  const history = {};

  const pushEntry = (toothNumber, condition, status, date) => {
    if (!toothNumber || !condition) return;
    const key = String(toothNumber);
    if (!history[key]) history[key] = [];
    history[key].push({ condition: String(condition), status, date: date || '' });
  };

  props.records.forEach((record) => {
    const date = record.record_date || record.created_at || '';
    // The diagnosed condition lives on the record; treatments describe the work done.
    const recordCondition = record.condition;

    if (record.tooth_number) {
      pushEntry(record.tooth_number, recordCondition || record.treatments?.[0]?.treatment_type, record.status, date);
    }

    if (Array.isArray(record.treatments)) {
      record.treatments.forEach((treatment) => {
        if (treatment.tooth_number && treatment.tooth_number !== record.tooth_number) {
          pushEntry(treatment.tooth_number, recordCondition || treatment.treatment_type, record.status, date);
        }
      });
    }
  });

  // Oldest first so the last entry is always the most recent condition.
  Object.keys(history).forEach((key) => {
    history[key].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  });

  return history;
});

const getNewCondition = (toothNumber) => {
  const entries = toothHistory.value[String(toothNumber)];
  return entries && entries.length ? entries[entries.length - 1] : null;
};

const getExistingCondition = (toothNumber) => {
  const entries = toothHistory.value[String(toothNumber)];
  if (!entries || entries.length < 2) return null;
  const latest = entries[entries.length - 1];
  // Prefer the most recent earlier entry whose condition differs from the new one.
  for (let i = entries.length - 2; i >= 0; i--) {
    if (entries[i].condition !== latest.condition) return entries[i];
  }
  return entries[entries.length - 2];
};

const getToothStatus = (toothNumber) => getNewCondition(toothNumber)?.status;

const getStatusDotClass = (status) => {
  const base = 'absolute top-0 right-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm';
  switch (status?.toLowerCase()) {
    case 'completed':
      return `${base} bg-emerald-500`;
    case 'scheduled':
    case 'pending':
      return `${base} bg-amber-400`;
    default:
      return '';
  }
};

// Condition colour palette — kept clinically conventional. Tweak the chrome around
// the chart, not these per-condition colours.
const getConditionColor = (condition) => {
  const c = (condition || '').toLowerCase();
  if (!c) return 'slate';
  if (c.includes('healthy') || c.includes('normal') || c.includes('sound')) return 'emerald';
  if (c.includes('decay') || c.includes('caries') || c.includes('cavity')) return 'red';
  if (c.includes('fill') || c.includes('restor')) return 'blue';
  if (c.includes('miss') || c.includes('extract')) return 'gray';
  if (c.includes('crack') || c.includes('fract')) return 'amber';
  if (c.includes('wisdom')) return 'purple';
  if (c.includes('impact')) return 'rose';
  if (c.includes('crown') || c.includes('cap')) return 'indigo';
  if (c.includes('root') || c.includes('rct') || c.includes('canal')) return 'teal';
  return 'sky';
};

const newPillClass = (condition) => `condition-pill condition-pill--new pill-${getConditionColor(condition)}`;
const oldPillClass = (condition) => `condition-pill condition-pill--old pill-${getConditionColor(condition)}`;

const handleToothClick = (toothNumber) => {
  emit('add-record-for-tooth', String(toothNumber));
};

// Small render-function component for a single tooth so the markup isn't repeated
// four times across quadrants.
const ToothCell = (cellProps) => {
  const tooth = cellProps.tooth;
  const newCond = getNewCondition(tooth);
  const oldCond = getExistingCondition(tooth);
  const status = getToothStatus(tooth);

  return h(
    'button',
    {
      type: 'button',
      onClick: () => handleToothClick(tooth),
      class: 'tooth-button group relative flex w-full flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg'
    },
    [
      // New condition (above)
      h('div', { class: 'condition-slot condition-slot--top' }, [
        newCond
          ? h('span', { class: newPillClass(newCond.condition), title: 'New condition: ' + newCond.condition }, newCond.condition)
          : null
      ]),

      // Tooth image
      h('div', { class: 'relative' }, [
        h('img', {
          src: getToothImagePath(tooth),
          onError: () => imageError(tooth),
          alt: 'Tooth ' + tooth,
          class: [
            'h-16 w-auto mx-auto transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:drop-shadow-md',
            toothImageExists[tooth] ? '' : 'opacity-40'
          ]
        }),
        !toothImageExists[tooth]
          ? h('span', { class: 'absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 pointer-events-none' }, 'No image')
          : null,
        status ? h('span', { class: getStatusDotClass(status) }) : null
      ]),

      // Tooth number + type icon
      h('div', { class: 'mt-1 flex flex-col items-center' }, [
        h('span', { class: 'text-[11px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums' }, String(tooth)),
        h('img', { src: getIconForTooth(tooth), alt: '', class: 'h-3 w-3 mt-0.5 opacity-70' })
      ]),

      // Existing condition (below)
      h('div', { class: 'condition-slot condition-slot--bottom' }, [
        oldCond
          ? h('span', { class: oldPillClass(oldCond.condition), title: 'Previous condition: ' + oldCond.condition }, oldCond.condition)
          : null
      ])
    ]
  );
};
ToothCell.props = ['tooth'];
</script>

<style scoped>
.dental-chart {
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.teeth-row {
  display: grid;
  grid-template-columns: repeat(16, minmax(44px, 1fr));
  gap: 0.25rem;
  justify-items: center;
}

.tooth-item {
  position: relative;
  width: 100%;
}

.tooth-button {
  padding: 0.25rem 0.125rem;
  transition: background-color 0.15s ease;
}
.tooth-button:hover {
  background-color: rgb(59 130 246 / 0.06);
}
:global(.dark) .tooth-button:hover {
  background-color: rgb(59 130 246 / 0.12);
}

/* Reserve consistent space above and below every tooth so the rows stay aligned
   whether or not a condition is present. */
.condition-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 20px;
  width: 100%;
}
.condition-slot--top {
  margin-bottom: 2px;
  align-items: flex-end;
}
.condition-slot--bottom {
  margin-top: 4px;
  align-items: flex-start;
}

.condition-pill {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10px;
  line-height: 1.35;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* The new (latest) condition is emphasised; the previous one is muted. */
.condition-pill--new {
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.08);
}
.condition-pill--old {
  background: transparent !important;
  border: 1px dashed currentColor;
  opacity: 0.75;
  font-weight: 500;
}

/* Per-condition colours (kept conventional). New = soft fill, old = outline. */
.pill-emerald { background: #d1fae5; color: #047857; }
.pill-red     { background: #fee2e2; color: #b91c1c; }
.pill-blue    { background: #dbeafe; color: #1d4ed8; }
.pill-gray    { background: #e5e7eb; color: #4b5563; }
.pill-amber   { background: #fef3c7; color: #b45309; }
.pill-purple  { background: #ede9fe; color: #6d28d9; }
.pill-rose    { background: #ffe4e6; color: #be123c; }
.pill-indigo  { background: #e0e7ff; color: #4338ca; }
.pill-teal    { background: #ccfbf1; color: #0f766e; }
.pill-sky     { background: #e0f2fe; color: #0369a1; }
.pill-slate   { background: #f1f5f9; color: #475569; }

:global(.dark) .pill-emerald { background: rgb(6 78 59 / 0.4); color: #6ee7b7; }
:global(.dark) .pill-red     { background: rgb(127 29 29 / 0.4); color: #fca5a5; }
:global(.dark) .pill-blue    { background: rgb(30 58 138 / 0.4); color: #93c5fd; }
:global(.dark) .pill-gray    { background: rgb(55 65 81 / 0.6); color: #d1d5db; }
:global(.dark) .pill-amber   { background: rgb(120 53 15 / 0.4); color: #fcd34d; }
:global(.dark) .pill-purple  { background: rgb(76 29 149 / 0.4); color: #c4b5fd; }
:global(.dark) .pill-rose    { background: rgb(136 19 55 / 0.4); color: #fda4af; }
:global(.dark) .pill-indigo  { background: rgb(49 46 129 / 0.4); color: #a5b4fc; }
:global(.dark) .pill-teal    { background: rgb(19 78 74 / 0.4); color: #5eead4; }
:global(.dark) .pill-sky     { background: rgb(7 89 133 / 0.4); color: #7dd3fc; }
:global(.dark) .pill-slate   { background: rgb(51 65 85 / 0.6); color: #cbd5e1; }
</style>
