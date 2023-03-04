import React from "react";
import { StrictMode, useCallback, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../css/main.css";

type Ctx = any;

interface TaskVariant {
  id: string;
  label: string;
  docs_logo: string;
  docs_url: string;
}

interface TaskParam {
  field: string;
  label: string;
  type: string;
  default: string;
}

interface Task {
  id: string;
  label: string;
  variants: TaskVariant[];
  params: TaskParam[];
}

interface Cred {
  default: string;
  field: string;
  label: string;
  type: string;
}

interface AppProps {
  ctx: Ctx;
  payload: {
    creds: Cred[];
    fields: {
      task_id: string;
      variant_id: string;
      openai_secret_key: string;
      openai_organization_id: string;
    };
    tasks: Task[];
  };
}

interface CredInputProps {
  cred: Cred;
  value: string;
  ctx: Ctx;
}

const CredInput = (props: CredInputProps) => {
  const { cred, ctx, value } = props;

  const handleClick = useCallback(() => {
    ctx.selectSecret((value: string) => {
      console.log(value);
      ctx.pushEvent("update_field", { field: cred.field, value });
    }, cred.default);
  }, []);

  return (
    <div className="inline-field">
      <label className="inline-input-label">{cred.label}</label>
      <input value={value} className="input input--xs" onClick={handleClick} />
    </div>
  );
};

interface InputProps {
  param: TaskParam;
  value: string;
  ctx: Ctx;
}

const Input = (props: InputProps) => {
  const { param, ctx, value } = props;

  const handleChange = useCallback((event) => {
    ctx.pushEvent("update_field", {
      field: param.field,
      value: event.target.value,
    });
  }, []);

  return (
    <div className="inline-field">
      <label className="inline-input-label">{param.label}</label>
      <input
        value={value}
        className="input input--xs"
        onChange={handleChange}
        type="number"
      />
    </div>
  );
};

const App = (props: AppProps) => {
  const { ctx, payload } = props;

  const [fields, setFields] = useState(payload.fields);

  const { creds } = payload;
  const selectedTask = payload.tasks.find(
    (task) => task.id === fields.task_id
  )!;

  const selectedVariant = selectedTask.variants.find(
    (variant) => variant.id === fields.variant_id
  )!;

  const params = selectedTask.params;

  useEffect(() => {
    ctx.handleEvent("update", (payload: { fields: any }) => {
      const { fields: updatedFields } = payload;
      setFields((fields) => ({ ...fields, ...updatedFields }));
    });
  }, [ctx]);

  return (
    <div class="app">
      <div class="container">
        <div class="header">
          <a
            class="icon-button"
            href={selectedVariant.docs_url}
            target="_blank"
            rel="noreferrer noopener"
          >
            <img src={selectedVariant.docs_logo} />
          </a>
          <div className="inline-field">
            {creds.map((cred) => {
              const value = fields[cred.field];
              return <CredInput cred={cred} ctx={ctx} value={value} />;
            })}
          </div>
        </div>
        <div className="row inline-field">
          {params.map((param) => {
            const value = fields[param.field];
            return <Input param={param} ctx={ctx} value={value} />;
          })}
        </div>
      </div>
    </div>
  );
};

export async function init(ctx, payload) {
  console.log(ctx, payload);
  await ctx.importCSS("./main.css");

  const root = createRoot(ctx.root);

  root.render(
    <StrictMode>
      <App ctx={ctx} payload={payload} />
    </StrictMode>
  );
}

// import * as Vue from "https://cdn.jsdelivr.net/npm/vue@3.2.26/dist/vue.esm-browser.prod.js";

// export async function init(ctx, payload) {
//   await Promise.all([
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
