defmodule KinoOpenai.MixProject do
  use Mix.Project

  @version "0.1.0"
  @description "OpenAi integration with Livebook"

  def project do
    [
      app: :kino_openai,
      version: @version,
      description: @description,
      name: "KinoOpenAi",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {KinoOpenAi.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:kino, "~> 0.8"},
      {:openai, "~> 0.2.3"}
    ]
  end
end
