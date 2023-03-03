defmodule KinoOpenAi.TaskCell do
  @moduledoc false
  alias KinoOpenAi.Application

  use Kino.JS, assets_path: "lib/assets/task_cell"
  use Kino.JS.Live
  use Kino.SmartCell, name: "OpenAi task"

  @creds %{
    openai_secret_key: nil,
    openai_organization_id: nil
  }

  @tasks [
    %{
      id: "text_completion",
      label: "Text Completion",
      variants: [
        %{
          id: "text-davinci-003",
          label: "Text Davinci 003",
          docs_logo: "openai_logo.png",
          docs_url: "https://platform.openai.com/docs/guides/completion",
          generation: %{
            engine_id: "text-devinci-003",
            default_text: "Yesterday, I was reading a book and"
          }
        }
      ],
      params: [
        %{field: "temperature", label: "Temperature", type: :number, default: 0.6},
        %{field: "max_length", label: "Max Length", type: :number, default: 150}
      ]
    }
  ]

  @default_task_id get_in(@tasks, [Access.at!(0), :id])
  @default_variant_id get_in(@tasks, [Access.at!(0), :variants, Access.at!(0), :id])

  @impl true
  def init(attrs, ctx) do
    task_id = attrs["task_id"] || @default_task_id

    fields = %{
      "task_id" => task_id,
      "variant_id" => attrs["variant_id"] || @default_variant_id
    }

    fields =
      for {field, default} <- field_defaults_for(task_id),
          into: fields,
          do: {field, attrs[field] || default}

    {:ok,
     assign(ctx,
       fields: fields,
       creds: @creds
     )}
  end

  defp field_defaults_for(task_id) do
    task = task_by_id(task_id)

    for param <- task.params, into: %{} do
      {param.field, param.default}
    end
  end

  @impl true
  def handle_connect(ctx) do
    {:ok,
     %{
       fields: ctx.assigns.fields,
       tasks: tasks(),
       creds: ctx.assigns.creds
     }, ctx}
  end

  @impl true
  def handle_event("update_openai_secret_key", value, ctx) do
    broadcast_event(ctx, "update_openai_secret_key", value)
    ctx = update(ctx, :creds, &Map.merge(&1, %{"openai_secret_key" => value}))
    {:noreply, ctx}
  end

  @impl true
  def handle_event("update_openai_organization_id", value, ctx) do
    broadcast_event(ctx, "update_openai_organization_id", value)
    ctx = update(ctx, :creds, &Map.merge(&1, %{"openai_organization_id" => value}))
    {:noreply, ctx}
  end

  @impl true
  def handle_event("update_field", %{"field" => "task_id", "value" => task_id}, ctx) do
    task = task_by_id(task_id)
    variant_id = hd(task.variants).id
    param_fields = field_defaults_for(task_id)

    fields =
      Map.merge(
        %{
          "task_id" => task_id,
          "variant_id" => variant_id
        },
        param_fields
      )

    ctx = assign(ctx, fields: fields)

    broadcast_event(ctx, "update", %{"fields" => fields})

    {:noreply, ctx}
  end

  def handle_event("update_field", %{"field" => field, "value" => value}, ctx) do
    current_task_id = ctx.assigns.fields["task_id"]

    param =
      Enum.find_value(tasks(), fn task ->
        task.id == current_task_id && Enum.find(task.params, &(&1.field == field))
      end)

    updated_fields = to_updates(field, value, param)
    ctx = update(ctx, :fields, &Map.merge(&1, updated_fields))

    broadcast_event(ctx, "update", %{"fields" => updated_fields})

    {:noreply, ctx}
  end

  defp to_updates(field, value, param), do: %{field => parse_value(value, param)}

  defp parse_value("", _param), do: nil
  defp parse_value(value, %{type: :number}), do: String.to_integer(value)

  defp parse_value(value, %{type: :select, options: options}) do
    Enum.find_value(options, fn option ->
      to_string(option.value) == value && option.value
    end)
  end

  defp parse_value(value, _param), do: value

  @impl true
  def to_attrs(ctx) do
    ctx.assigns.fields
  end

  @impl true
  def to_source(attrs) do
    for quoted <- to_quoted(attrs), do: Kino.SmartCell.quoted_to_string(quoted)
  end

  defp to_quoted(%{"task_id" => "text_completion"} = attrs) do
    opts =
      drop_nil_options(
        temperature: attrs["temperature"],
        max_tokens: attrs["max_length"]
      )

    %{generation: generation} = variant_from_attrs(attrs)

    [
      quote do
        Application.put_env(
          :openai,
          :api_key,
          System.fetch_env!("LB_OPEN_AI_API_KEY")
        )
      end,
      quote do
        text_input = Kino.Input.textarea("Text", default: unquote(generation.default_text))
        form = Kino.Control.form([text: text_input], submit: "Run")

        frame = Kino.Frame.new()

        form
        |> Kino.Control.stream()
        |> Kino.listen(fn %{data: %{text: text}} ->
          Kino.Frame.render(frame, Kino.Markdown.new("Running..."))

          case OpenAI.completions("text-davinci-003", prompt: text, max_tokens: 150) do
            {:ok, result} ->
              t = result |> Map.get(:choices) |> Enum.at(0) |> Map.get("text")
              Kino.Frame.render(frame, Kino.Markdown.new(t))

            {:error, error} ->
              Kino.Frame.render(frame, Kino.Markdown.new(error |> Kernel.inspect()))
          end
        end)

        Kino.Layout.grid([form, frame], boxed: true, gap: 16)
      end
    ]
  end

  defp to_quoted(_) do
    []
  end

  defp drop_nil_options(opts) do
    Enum.reject(opts, &match?({_key, nil}, &1))
  end

  defp tasks(), do: @tasks

  defp task_by_id(task_id) do
    Enum.find(tasks(), &(&1.id == task_id))
  end

  defp variant_by_id(task_id, variant_id) do
    task = task_by_id(task_id)
    Enum.find(task.variants, &(&1.id == variant_id))
  end

  defp variant_from_attrs(attrs) do
    variant_by_id(attrs["task_id"], attrs["variant_id"])
  end
end
