const request = require("supertest");

describe("Task 1", () => {
  describe("POST /parse", () => {
    const getTask1 = async (inputStr) => {
      return await request("http://localhost:8080")
        .post("/parse")
        .send({ input: inputStr });
    };

    it("example1", async () => {
      const response = await getTask1("Riz@z RISO00tto!");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });

    it("example2", async () => {
      const response = await getTask1("alpHa-alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("error case", async () => {
      const response = await getTask1("");
      expect(response.status).toBe(400);
    });

    it("extra spaces", async () => {
      const response = await getTask1("   Riz@z   RISO00tto!   ");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });
    it("other whitespace chars", async () => {
      const response = await getTask1("\t\n Riz@z\n\t \s\s  RISO00tto!\t \n  ");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });
  });
});

describe("Task 2", () => {
  describe("POST /entry", () => {
    const putTask2 = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    it("Add Ingredients", async () => {
      const entries = [
        { type: "ingredient", name: "Egg", cookTime: 6 },
        { type: "ingredient", name: "Lettuce", cookTime: 1 },
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(200);
        expect(resp.body).toStrictEqual({});
      }
    });

    it("Add Recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [{ name: "Beef", quantity: 0 }],
      };
      const resp1 = await putTask2(meatball);
      expect(resp1.status).toBe(200);
    });

    it("Congratulations u burnt the pan pt2", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "beef",
        cookTime: -1,
      });
      expect(resp.status).toBe(400);
    });

    it("Congratulations u burnt the pan pt3", async () => {
      const resp = await putTask2({
        type: "pan",
        name: "pan",
        cookTime: 20,
      });
      expect(resp.status).toBe(400);
    });

    it("Unique names", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 10,
      });
      expect(resp.status).toBe(200);

      const resp2 = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp2.status).toBe(400);

      const resp3 = await putTask2({
        type: "recipe",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp3.status).toBe(400);
    });
    it("extra fields", async () => {
      const entries = [
        { type: "ingredient", name: "Gary", cookTime: 0, still: "got the blues"},
        { type: "ingredient", name: "Thom", cookTime: 1, whatthehellamidoinghere: "idontbelonghere" },
        {
        type: "recipe",
        name: "Elliot",
        requiredItems: [{ name: "Bruh", quantity: 1, say: "yes"}],
        },
        {
        type: "recipe",
        name: "Smith",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
          there_is_a_light: "that never goes out"
        }
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(400);
      }
    });
    it("Unique recipe names", async () => {
      const resp = await putTask2({
        type: "recipe",
        name: "SRV",
        requiredItems: [{ name: "Bruh", quantity: 2 }, {name: "Bruh", quantity: 0 }],
      });
      expect(resp.status).toBe(400);
    });
    it("Missing fields", async () => {
      const entries = [
        { type: "ingredient", name: "Greeny" },
        { type: "ingredient", cookTime: 1},
        {
        type: "recipe",
        name: "doctor_penguin"
        },
        {
        type: "recipe",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
        },
        {
        type: "recipe",
        name: "doctor_penguin",
        requiredItems: [{ name: "Bruh" }],
        },
        {
        type: "recipe",
        name: "doctor_penguin",
        requiredItems: [{quantity: 1}],
        }
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(400);
      }
    });
  });
});

describe("Task 3", () => {
  describe("GET /summary", () => {
    const postEntry = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    const getTask3 = async (name) => {
      return await request("http://localhost:8080").get(
        `/summary?name=${name}`
      );
    };

    it("What is bro doing - Get empty cookbook", async () => {
      const resp = await getTask3("nothing");
      expect(resp.status).toBe(400);
    });

    it("What is bro doing - Get ingredient", async () => {
      const resp = await postEntry({
        type: "ingredient",
        name: "beef",
        cookTime: 2,
      });
      expect(resp.status).toBe(200);

      const resp2 = await getTask3("beef");
      expect(resp2.status).toBe(400);
    });

    it("Unknown missing item", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Cheese");
      expect(resp2.status).toBe(400);
    });

    it("Bro cooked", async () => {
      const meatball = {
        type: "recipe",
        name: "Skibidi",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "ingredient",
        name: "Bruh",
        cookTime: 2,
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Skibidi");
      expect(resp3.status).toBe(200);
    });
    
    it("When you come to my aunt's house, make sure there's no cycles in ya recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Gabagool",
        requiredItems: [{ name: "Capacolla", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "recipe",
        name: "Capacolla",
        requiredItems: [{ name: "Gabagool", quantity: 1 }],
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Gabagool");
      expect(resp3.status).toBe(400);
    });

    it("its just me myself and I", async () => {
      const meatball = {
        type: "recipe",
        name: "Mortadella",
        requiredItems: [{ name: "Mortadella", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp3 = await getTask3("Mortadella");
      expect(resp3.status).toBe(400);
    });

    it("my mamma makea da pasta from scratch!", async () => {
      let Spaghetti = {
        type: "recipe",
        name: "Skibidi Spaghetti",
        requiredItems: [
          {
            name: "Meatball",
            quantity: 3
          },
          {
            name: "Pasta",
            quantity: 1
          },
          {
            name: "Tomato",
            quantity: 2
          }
        ]
      }
      let meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [
          {
            name: "Beef",
            quantity: 2
          },
          {
            name: "Egg",
            quantity: 1
          }
        ]
      }

      let pasta = {
        type: "recipe",
        name: "Pasta",
        requiredItems: [
          {
            name: "Flour",
            quantity: 3
          },
          {
            name: "Egg",
            quantity: 1
          }
        ]
      }
      let beef = {
        type: "ingredient",
        name: "Beef",
        cookTime: 5
      }
      let egg = {
        type: "ingredient",
        name: "Egg",
        cookTime: 3,
      }
      let flour = {
        type: "ingredient",
        name: "Flour",
        cookTime: 0
      }
      let tomato = {
        type: "ingredient",
        name: "Tomato",
        cookTime: 2,
      }
      const entries = [Spaghetti, meatball, pasta, beef, egg, flour, tomato]
      for (const entry of entries) {
        const resp1 = await postEntry(entry);
        expect(resp1.status).toBe(200);
      }

      const summary = {
        name: "Skibidi Spaghetti",
        cookTime: 46,
        ingredients: [
          {
            name: "Beef",
            quantity: 6
          },
          {
            name: "Flour",
            quantity: 3
          },
          {
            name: "Egg",
            quantity: 4
          },
          {
            name: "Tomato",
            quantity: 2
          }
        ]
      } 
      const resp3 = await getTask3("Skibidi Spaghetti");
      expect(resp3.status).toBe(200);
      resp3.body.ingredients.sort((a, b) => a.name.localeCompare(b.name));
      summary.ingredients.sort((a,b) => a.name.localeCompare(b.name));

      console.log(`summary is ${JSON.stringify(summary)}, body is ${JSON.stringify(resp3.body)}`);
      expect(resp3.body).toStrictEqual(summary);
    });
  });
});
