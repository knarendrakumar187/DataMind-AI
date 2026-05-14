import os
import json


class LLMClient:
    def __init__(self):
        self.model = "llama-3.1-8b-instant"
        self._client = None
        self._init_client()

    def _init_client(self):
        try:
            from groq import Groq
            api_key = os.getenv("GROQ_API_KEY")
            if api_key and api_key != "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx":
                self._client = Groq(api_key=api_key)
        except Exception:
            self._client = None

    def _ask(self, system_prompt: str, user_prompt: str) -> str:
        if self._client is None:
            return self._fallback_response(user_prompt)
        try:
            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=500,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"AI explanation unavailable — check your Groq API key. ({str(e)[:100]})"

    def _fallback_response(self, prompt: str) -> str:
        return ("AI explanation unavailable — please add your Groq API key to the backend/.env file. "
                "Get a free key at https://console.groq.com")

    def explain_dataset(self, analysis: dict, expertise: str) -> str:
        system = "You are a data science assistant. Be helpful and clear."
        shape = analysis.get("shape", {})
        issues = analysis.get("issues", [])
        target_suggestions = analysis.get("target_suggestions", [])
        user = f"""
Analyze this dataset for a {expertise} user:
- Rows: {shape.get('rows', '?')}, Columns: {shape.get('columns', '?')}
- Task type detected: {analysis.get('task_type', 'unknown')} (confidence: {analysis.get('task_confidence', 0):.0%})
- Data quality score: {analysis.get('data_quality_score', 0)}/100
- Issues: {', '.join(issues) if issues else 'None'}
- Target column suggestion: {target_suggestions[0] if target_suggestions else 'Not detected'}

In 3-4 sentences explain: what this data is good for, the detected task,
and one data quality tip. {"Use simple terms." if expertise == "beginner" else "Be technical."}
"""
        return self._ask(system, user)

    def explain_model_recommendation(self, model: dict, analysis: dict, expertise: str) -> str:
        system = "You are a machine learning tutor."
        shape = analysis.get("shape", {})
        user = f"""
Explain to a {expertise} why {model.get('name', 'this model')} was recommended.
Dataset: {shape.get('rows', '?')} rows, task: {analysis.get('task_type', 'unknown')}
Model pros: {', '.join(model.get('pros', []))}
Model cons: {', '.join(model.get('cons', []))}
In 2-3 sentences, explain why this model is suitable for this specific dataset.
"""
        return self._ask(system, user)

    def explain_results(self, metrics: dict, task_type: str, model_name: str, expertise: str) -> str:
        system = "You are a data science results interpreter."
        user = f"""
A {expertise} trained {model_name} for {task_type}.
Results: {json.dumps(metrics)}

In 3-4 sentences:
1. Is this performance good/average/poor? Be honest.
2. What does the key metric mean in plain English?
3. One specific action to improve it.
{"Avoid jargon." if expertise == "beginner" else "Include technical detail."}
"""
        return self._ask(system, user)

    def answer_question(self, question: str, context: dict, expertise: str) -> str:
        system = "You are a helpful data science tutor for students."
        user = f"""
Context: Dataset task={context.get('task_type', 'unknown')},
model={context.get('model_name', 'none')}, rows={context.get('rows', '?')}

User ({expertise}) asks: {question}

Answer helpfully in under 100 words.
"""
        return self._ask(system, user)

    def generate_abb_insights(self, analysis: dict, metrics: dict) -> str:
        system = "You are an industrial AI expert familiar with ABB systems."
        shape = analysis.get("shape", {})
        user = f"""
This DataMind AI tool analyzed a dataset with {shape.get('rows', '?')} rows.
Task: {analysis.get('task_type', 'unknown')}, Quality: {analysis.get('data_quality_score', 0)}/100
Model performance: {json.dumps(metrics) if metrics else 'Not yet trained'}

In 3 sentences, explain how this tool's capability is relevant
to industrial automation companies like ABB that deal with
sensor data, equipment monitoring, and predictive maintenance.
"""
        return self._ask(system, user)
