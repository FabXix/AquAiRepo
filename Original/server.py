from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

openai.api_key = 'NUESTRALLAVA' #No lo compartimos por seguridad

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    section_id = data['section_id']
    value = data['value']
    average = data['average']

    prompt = f"Give recommendations for {section_id} with value {value} and average {average}."

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100
    )

    return jsonify(response.choices[0].text.strip())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
