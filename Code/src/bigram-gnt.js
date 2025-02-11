import { Reader } from "./reader.js";
import { Provider } from "./provider.js";

export class GNT
{
    constructor()
    {
        this.corpusReader = new Reader("corpus");
        this.corpus = new Array();
        this.vocab = new Array();
        this.counts = new Array();
    }

    async exe()
    {
        await this.buildcorpus();
        await this.buildVocabulary();
        await this.buildProbability();
    }

    async buildcorpus()
    {
        this.corpus = new Array();
        //read the cover file as text from the reader
        var data = await this.corpusReader.readSingleAsText();
        data = data.data;
        data = data.replace(/[\t\n]/g, " . ");
        data = data.replace(/\s/g, " ");
        data = data.replace(/\./g, " . ");
        data = data.replace(/[^a-zA-Z0-9 \.]/g, "");
        data = data.toLowerCase();
        data = data.split(" ");
        
        for(var item of data)
        {
            if(item != "")
            {
                this.corpus.push(item);
            }
        }
        //this.corpus = this.corpus.sort();
    }

    async buildVocabulary()
    {
        this.vocab = new Array();
        for(var item of this.corpus)
        {
            if(!isAlreadyThere(item, this.vocab))
            {
                this.vocab.push(item);
            }
        }

        function isAlreadyThere(item, list)
        {
            for(var i of list)
            {
                if(i == item)
                {
                    return true;
                }
            }
            return false;
        }
    }

    word2id(word)
    {
        for(var i = 0; i < this.vocab.length; i++)
        {
            if(this.vocab[i] == word)
            {
                return i;
            }
        }
        return -1;
    }

    async buildProbability() //bigram
    {
        this.counts = new Array();
        this.counts = Array(this.vocab.length).fill().map(() => Array(this.vocab.length).fill(0));

        console.log(this.counts);

        for(var i = 0; i < this.corpus.length-1; i++)
        {
            var w_one = this.word2id(this.corpus[i]);
            var w_two = this.word2id(this.corpus[i+1]);
            this.counts[w_one][w_two] = this.counts[w_one][w_two] + 1;
        }

        this.rows = new Array();
        for(var row of this.counts)
        {
            var rowsum = 0;
            for(var column of row)
            {
                rowsum += column;
            }
            this.rows.push(rowsum);
        }

        this.prob = new Array();
        this.prob = Array(this.vocab.length).fill().map(() => Array(this.vocab.length).fill(0));
        for(var x = 0; x < this.vocab.length; x++)
        {
            for(var y = 0; y < this.vocab.length; y++)
            {
                this.prob[x][y] = this.counts[x][y]/this.rows[x];
            }
        }

        alert("ready for synthesis");
    }

    get_next_word(w)
    {
        var prob_row = this.prob[this.word2id(w)];
        var choice_row = this.vocab;

        var random = Math.random();

        var counter = 0;
        for (let i = 0; i < prob_row.length; i++)
        {
            counter += prob_row[i];
            if (counter > random)
            {
                return choice_row[i];
            }
        }
    }

    generate_text(start, length)
    {
        var words = new Array();
        words.push(start);

        for(var i = 0; i < length; i++)
        {
            var next = this.get_next_word(words[words.length-1]);
            words.push(next);
        }

        document.getElementById("output").innerHTML += "";
        var result = "";
        for(var word of words)
        {
           result += " " + word;
        }
        result = result.replace(/[\.\ ]*\.[\.\ ]*/g, ".\n");
        result = result.replace(/\ s\ /g, "'s ");
        document.getElementById("output").value = result;
    }
}



            