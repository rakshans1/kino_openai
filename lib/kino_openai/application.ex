defmodule KinoOpenAi.Application do
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    Kino.SmartCell.register(KinoOpenAi.TaskCell)

    children = []
    opts = [strategy: :one_for_one, name: KinoOpenAi.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
