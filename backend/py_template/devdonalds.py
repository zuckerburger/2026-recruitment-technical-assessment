from dataclasses import dataclass, fields
from collections import defaultdict
from typing import List, Dict, Union, TypeVar, Tuple
from flask import Flask, request, jsonify
import re
import string

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
    name: str
    type: str

@dataclass
class RequiredItem():
    name: str
    quantity: int

@dataclass
class Recipe(CookbookEntry):
    requiredItems: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
    cookTime: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook: Dict[str, CookbookEntry] = dict() 

# Task 1 helper (don't touch)
@app.route('/parse', methods=['POST'])
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

    # I used this built in approach since it's more concise
    recipeName = recipeName.replace('-', ' ').replace('_', ' ')
    recipeName = re.sub(r'[^a-zA-Z\s]', '', recipeName)
    recipeName = string.capwords(recipeName)
    return recipeName if (recipeName) else None

    # here's an alternative more procedural approach although less readable
    # I used timeit and this 2nd approach is around 10x faster since it doesn't need to make
    # as many copies (since strings are immutable in python)
    # pls hire me thx

    # characters to be replaced by space - easily extendible
    whitespace = {'-', '_'}
    newRecipe = ''
    # tracks last character added
    prev = ' '
    for char in recipeName:
        if char in whitespace or char.isspace():
            # add a space iff last character isn't whitespace
            if prev.isspace() == False:
                newRecipe += ' ' 

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
    generic_err = 'Invalid entry format',400
    name_err = 'Entry name already exists',400
    success = '',200

    try:
        data = request.get_json()
        if not data:
            return generic_err 

        dataType = data.get('type')
        name = parse_handwriting(data.get('name',''))
        if name is None: 
            return generic_err
        if name in cookbook:
            return name_err

        result = generic_err
        if dataType == 'recipe':
            result = create_recipe(data)
        elif dataType == 'ingredient': 
            result =  create_ingredient(data)

        print(f'result is {result}')
        if not isinstance(result, CookbookEntry):
            return result

        cookbook[result.name] = result
        return success

    except Exception as error:
        err=f'Unexpected error: {error}',400
        return err

T = TypeVar('T')
#  Generic function that checks if dictionary has the exact properties 
def keys_match(data: dict, dataType: T) -> bool:
    valid_keys = set(field.name for field in fields(dataType))
    return valid_keys == set(data.keys())

# Creates and returns a Recipe object if data is valid, else error msg and status
def create_recipe(data: dict) -> Union[Recipe,Tuple[str,int]]:
    recipe_err = 'Invalid recipe format',400
    if not keys_match(data, Recipe):
        return recipe_err

    name = data['name']
    item_names = set()
    items = []
    for item in data['requiredItems']:
        if not keys_match(item, RequiredItem):
            return recipe_err

        item_name,quantity = item['name'],item['quantity']
        if not isinstance(quantity,int):
            return f'"{item_name}" quantity "{quantity}" invalid',400
        if item_name in item_names:
            return f'Duplicate "{item_name}" in recipe',400

        items.append(RequiredItem(item_name, quantity))
        item_names.add(item_name)
    return Recipe(name,'recipe',items)

# Creates and returns an Ingredient object if data is valid, else error msg and status
def create_ingredient(data: dict) -> Union[Ingredient, Tuple[str,int]]:
    ingredient_err = 'Invalid ingredient format',400
    if not keys_match(data,Ingredient):
        return ingredient_err
    
    name,cooktime = data['name'], data['cookTime']
    if not isinstance(cooktime, int) or cooktime < 0:
        return f'Cook time "{cooktime}" invalid',400

    return Ingredient(name,'ingredient',cooktime)

# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
    # TODO: implement me
    not_found_err = 'No recipe found',400
    circular_err = 'Circular dependency uh oh!',400

    name = request.args.get('name')
    visited_recipes = set()
    ingredients = defaultdict(int)
    cooktime = 0

    # Recursively get all the info for a recipe, return HTTP msg and status
    def get_recipe_info(name: str, quantity: int = 1) -> None:
        if not name or name not in cookbook:
            return f'{name} not found!',400

        if name in visited_recipes:
            return circular_err
        entry = cookbook[name]

        if entry.type == 'recipe':
            visited_recipes.add(name)
            for item in entry.requiredItems:
                result = get_recipe_info(item.name, item.quantity * quantity)
                if  result is not None:
                    return result 
        else:
            nonlocal cooktime
            ingredients[name] += quantity
            cooktime += entry.cookTime * quantity
        return None

    result = get_recipe_info(name)
    print(f'result is {result}')
    if result is not None:
        return result

    if len(visited_recipes) == 0:
        return f'{name} is not a recipe!',400
    ingredients = [{
                    'name': name,
                    'quantity':quantity
                    } for name,quantity in ingredients.items()]
    res = {'name': name, 'cookTime': cooktime, 'ingredients': ingredients}
    print(f'res is {res}')
    return jsonify(res),200


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
    app.run(debug=True, port=8080)
