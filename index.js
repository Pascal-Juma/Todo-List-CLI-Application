import { Command } from 'commander';
import chalk from 'chalk';
import prompts from 'prompts';
import { PrismaClient} from '@prisma/client';
import { nanoid } from 'nanoid';
import Table from 'cli-table3';



const program = new Command();
const client  = new PrismaClient();

program.command('Add-Todo')
    .description('Adds a new Todo to the list.')
    .action(async function () {
        console.log(chalk.magentaBright(`Welcome to CLI Todo App. Add Tasks that you wish to accomplish today. Good luck with your day!`));
        try{
            const response = await prompts([
                {
                    type: "text",
                    name: "title",
                    message: "Enter the title of the Todo",
                },
                {
                    type: "text",
                    name: "description",
                    message: "Enter the description of the Todo"
                },
                {
                    type: "select",
                    name: "status",
                    message: "Enter the status of your Todo",
                    choices: [
                        {title: "pending", description:"Not Started yet", value: "pending"},
                        {title: "in-progress", description:"Has Started but not completed", value: "in-progress"},
                        {title: "complete", description:"Has been completed", value: "complete"}
                    ],
                    initial : 0,
                    hint: '- Use Arrow Keys to navigate. Enter to Submit'
                }
            ]);
            await client.todo.create({
                data: {
                    id: nanoid(4),
                    title: response.title,
                    description: response.description,
                    status: response.status 
                }
            })
            console.log(chalk.greenBright(`A New Todo added successfully`));
        }catch (e){
            console.log(chalk.redBright(`There was an Error adding the Todo`));
            console.log(chalk.blueBright(`${e.message}`));
        };
    });

program.command('View-Todos')
    .description('View all your todos or view a specific todo.')
    .option('-i | --id <value>', 'Id of the Todo')
    .action(async function (options) {
        const todosId = options.id;
        try{
            if(todosId){
                const foundTodo = await client.todo.findFirst({
                    where: { id: todosId}
                })
            if(!foundTodo){
                console.log(chalk.redBright(`Todo with id -${todosId} was not found`))
            }else{
            const table = new Table({
                head: ['id', 'title', 'description', 'status']
            })
            table.push([foundTodo.id, foundTodo.title, foundTodo.description, foundTodo.status]);
            console.log(table.toString());
        }
        }else{
            const foundTodos = await client.todo.findMany();
            const table = new Table({
                head: ['id', 'title', 'description', 'status' ]
            })
            foundTodos.forEach(function(todoItem){
                table.push([todoItem.id, todoItem.title, todoItem.description, todoItem.status])
            })
            console.log(table.toString());
        }
        }catch(e){
            console.log(chalk.redBright(`There was an Error Retrieving the Todo`));
            console.log(chalk.blueBright(`${e.message}`));
        }
    })

program.command("Update-Todo")
    .description("Updates A specific Todo")
    .requiredOption("-i, --id <value>", "Id of the Todo list")
    .option("-t, --title <value>", "New title to update")
    .option("-d, --description <value>", "New description to update")
    .option("-s, --status <value>", "New status to update")
    .action(async function(options){
        const id = options.id;
        const newDescription = options.description;
        const newTitle = options.title;
        const newStatus = options.status;
        try{
            await client.todo.update({
                where: {id},
                data: {
                    title: newTitle && newTitle,
                    description: newDescription && newDescription,
                    status: newStatus && newStatus
                }
            })
            console.log(chalk.green(`Your Todo is successfully updated`))
        }catch(e){
            console.log(chalk.red(`An Error occured Updating your Todo... try again later`))
        }
    })

program.command("Delete-Todo")
    .description("Deletes a specific todo")
    .requiredOption("-i, --id <value>", "Id of the Todo to Delete")
    .action(async function(options){
        const id = options.id
        try{
            await client.todo.delete({
                where: {id}
            })
            console.log(chalk.blueBright(`Your Todo has been successfully deleted`))
        }catch(e){
            console.log(chalk.red(`An Error occured deleting your Todo... try again later`))
        }
    })

program.command("Delete-All")
    .description("Deletes all the contacts")
    .action(  async function(){
        console.log(chalk.magentaBright(`You are about Clear all your Todo List!`))
        try{
            const response = await prompts({
                type: 'select',
                name: 'decision',
                message: 'Will you proceed to delete all your Todos ?',
                choices: [
                    {title: 'Yes', value: 'yes'},
                    {title: 'No', value: 'no'}
                ]
            })
            if(response.decision === 'yes'){
                await client.todo.deleteMany();
            }
            console.log(chalk.magentaBright(`All your Todo list has been successfully deleted`))
        }catch(e){
            console.log(chalk.red(`An Error Deleting All your Todos... try again later`))
        }
    })


program.parseAsync();