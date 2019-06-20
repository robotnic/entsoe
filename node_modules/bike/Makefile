
SRC = $(shell find lib -name "*.js" -type f)
UGLIFY = $(shell find node_modules -name "uglifyjs" -type f)
UGLIFY_FLAGS =
BROWSERBUILD = $(shell find node_modules -name "browserbuild" -type f)
BROWSERBUILD_FLAGS =-b lib/ -g bike -m bike.js
REPORTER = dot

all: clean runtime.js bike.min.js test docs

clean:
	@rm -rf docs
	@rm -f bike.js
	@rm -f bike.min.js

bike.js: $(SRC)
	@node support/compile $^

runtime.js: ${SRC}
	${BROWSERBUILD} ${BROWSERBUILD_FLAGS} ${SRC} > $@

bike.min.js: bike.js
	@$(UGLIFY) $(UGLIFY_FLAGS) $< > $@ \
		&& du bike.min.js \
		&& du bike.js

test:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER)

docs:
	@mkdir -p docs/bike
	@node ./support/docs

.PHONY: clean test docs