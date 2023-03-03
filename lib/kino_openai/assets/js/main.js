console.log("hi");

// import * as Vue from "https://cdn.jsdelivr.net/npm/vue@3.2.26/dist/vue.esm-browser.prod.js";

// export async function init(ctx, payload) {
//   await Promise.all([
//     ctx.importCSS("main.css"),
//     ctx.importCSS(
//       "https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap"
//     ),
//     ctx.importCSS(
//       "https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap"
//     ),
//     ctx.importCSS(
//       "https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.min.css"
//     ),
//   ]);

//   const BaseSelect = {
//     name: "BaseSelect",

//     props: {
//       label: {
//         type: String,
//         default: "",
//       },
//       selectClass: {
//         type: String,
//         default: "input",
//       },
//       modelValue: {
//         type: String,
//         default: "",
//       },
//       options: {
//         type: Array,
//         default: [],
//         required: true,
//       },
//       required: {
//         type: Boolean,
//         default: false,
//       },
//       inline: {
//         type: Boolean,
//         default: false,
//       },
//       disabled: {
//         type: Boolean,
//         default: false,
//       },
//     },

//     template: `
//     <div v-bind:class="inline ? 'inline-field' : 'field'">
//       <label v-bind:class="inline ? 'inline-input-label' : 'input-label'">
//         {{ label }}
//       </label>
//       <select
//         :value="modelValue"
//         v-bind="$attrs"
//         v-bind:disabled="disabled"
//         @change="$emit('update:modelValue', $event.target.value)"
//         v-bind:class="selectClass"
//       >
//         <option
//           v-for="option in options"
//           :value="option.value || ''"
//           :key="option"
//           :selected="option.value === modelValue"
//         >{{ option.label }}</option>
//       </select>
//     </div>
//     `,
//   };

//   const BaseInput = {
//     name: "BaseInput",

//     props: {
//       label: {
//         type: String,
//         default: "",
//       },
//       inputClass: {
//         type: String,
//         default: "input",
//       },
//       modelValue: {
//         type: [String, Number],
//         default: "",
//       },
//       inline: {
//         type: Boolean,
//         default: false,
//       },
//       grow: {
//         type: Boolean,
//         default: false,
//       },
//     },

//     template: `
//     <div v-bind:class="[inline ? 'inline-field' : 'field', grow ? 'grow' : '']">
//       <label v-bind:class="inline ? 'inline-input-label' : 'input-label'">
//         {{ label }}
//       </label>
//       <input
//         :value="modelValue"
//         @input="$emit('update:modelValue', $event.target.value)"
//         v-bind="$attrs"
//         v-bind:class="inputClass"
//       >
//     </div>
//     `,
//   };

//   const app = Vue.createApp({
//     components: { BaseSelect, BaseInput },
//     template: `
//       <div class="app">
//         <form @change="handleFieldChange">
//           <div class="container">
//             <div class="header">
//               <a class="icon-button" :href="selectedVariant.docs_url" target="_blank" rel="noreferrer noopener">
//                 <img :src="selectedVariant.docs_logo" />
//               </a>
//               <BaseSelect
//                 name="task_id"
//                 label="Task"
//                 :value="fields.task_id"
//                 selectClass="input"
//                 :inline
//                 :options="taskOptions"
//               />
//               <div class="variant-container">
//                 <BaseSelect
//                   name="variant_id"
//                   label="Using"
//                   :value="fields.variant_id"
//                   selectClass="input"
//                   :inline
//                   :options="variantOptions"
//                 />
//               </div>
//               <div class="secret-key-container">
//                 <BaseInput
//                   name="secret_key"
//                   label="Secret Key"
//                   :value="fields.secret_key"
//                   inputClass="input input--xs"
//                   type="string"
//                 />
//               </div>
//               <div class="organization-id-container">
//                 <BaseInput
//                   name="organization_id"
//                   label="Organization ID"
//                   :value="fields.organization_id"
//                   inputClass="input input--xs"
//                   type="string"
//                 />
//               </div>
//             </div>
//             <div class="row">
//               <div v-for="param in selectedTask.params">
//                 <BaseInput
//                   v-if="param.type === 'number'"
//                   :name="param.field"
//                   :label="param.label"
//                   :type="param.type"
//                   :value="fields[param.field]"
//                   inputClass="input input--xs"
//                 />
//                 <BaseSelect
//                   v-if="param.type === 'select'"
//                   :name="param.field"
//                   :label="param.label"
//                   :value="fields[param.field]"
//                   inputClass="input"
//                   :options="param.options"
//                 />
//               </div>
//             </div>
//             <div v-if="selectedTask.note" class="note">
//               <span class="note-caption">Note:</span>
//               {{ selectedTask.note }}
//             </div>
//           </div>
//         </form>
//       </div>
//     `,

//     data() {
//       return {
//         showHelpBox: true,
//         fields: payload.fields,
//         taskOptions: payload.tasks.map((task) => ({
//           value: task.id,
//           label: task.label,
//         })),
//       };
//     },

//     computed: {
//       selectedTask() {
//         return payload.tasks.find((task) => task.id === this.fields.task_id);
//       },

//       selectedVariant() {
//         return this.selectedTask.variants.find(
//           (variant) => variant.id === this.fields.variant_id
//         );
//       },

//       variantOptions() {
//         return this.selectedTask.variants.map((variant) => ({
//           value: variant.id,
//           label: variant.label,
//         }));
//       },
//     },

//     methods: {
//       handleFieldChange(event) {
//         const { name: field, value } = event.target;

//         if (field) {
//           ctx.pushEvent("update_field", { field, value });
//         }
//       },

//       toggleHelpBox(_) {
//         this.showHelpBox = !this.showHelpBox;
//       },
//     },
//   }).mount(ctx.root);

//   ctx.handleEvent("update", ({ fields }) => {
//     setValues(fields);
//   });

//   function setValues(fields) {
//     for (const field in fields) {
//       app.fields[field] = fields[field];
//     }
//   }
// }
