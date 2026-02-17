from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re
import string

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
	name: str

@dataclass
class RequiredItem():
	name: str
	quantity: int

@dataclass
class Recipe(CookbookEntry):
	required_items: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
	cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = None

# Task 1 helper (don't touch)
@app.route("/parse", methods=['POST'])
def parse():
	data = request.get_json()
	recipe_name = data.get('input', '')
	parsed_name = parse_handwriting(recipe_name)
	if parsed_name is None:
		return 'Invalid recipe name', 400
	return jsonify({'msg': parsed_name}), 200

# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that satisfies conditions
def parse_handwriting(recipeName: str) -> Union[str | None]:

	# I used this built in approach since it's more readable and concise
	recipeName = recipeName.replace('-', ' ').replace('_', ' ')
	recipeName = re.sub(r'[^a-zA-Z\s]', '', recipeName)
	recipeName = string.capwords(recipeName)
	return recipeName if (recipeName) else None

	# here's an alternative, more procedural approach, although less readable
	# I used time it and this approach is around 10x faster since it doesn't need to make
	# as many copies (since strings are immutable in python)
	# pls hire me

	# characters to be replaced by space - easily extendible
	whitespace = {'-', '_'}
	newRecipe = ""
	# tracks last character added
	prev = " "
	for char in recipeName:
		if char in whitespace or char.isspace():
			# add a space iff last character isn't whitespace
			if prev.isspace() == False:
				newRecipe += " " 

		elif char.isalpha():
			# capitalise start of word, otherwise lower
			char = char.upper() if prev.isspace() else char.lower()
			newRecipe += char
		prev = newRecipe[-1] if newRecipe else prev
	return newRecipe if newRecipe else None

	

# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route('/entry', methods=['POST'])
def create_entry():
	# TODO: implement me
	return 'not implemented', 500


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
	# TODO: implement me
	return 'not implemented', 500


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
	app.run(debug=True, port=8080)
