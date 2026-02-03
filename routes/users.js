var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
        res.status(200).send("GET /users");
    }
);

router.get('/:id', (req, res) => {
        const userId = req.params.id;
        res.status(200).send("GET /users/" + userId);
    }
);

router.delete('/', (req, res) => {
        res.status(200).send("DELETE /users");
    }
);
router.delete('/', (req, res) => {
        res.status(200).send("DELETE /users");
    }
);

router.put('/:id', (req, res) => {
        const userId = req.params.id;
        res.status(200).send("PUT /users/" + userId);
    }
);


module.exports = router;
