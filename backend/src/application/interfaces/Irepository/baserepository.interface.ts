
export interface IBaseRepository<T> {

    

    create(data: Partial<T>): Promise<T> 

    findById(id: string): Promise<T | null> 

    findAll(): Promise<T[]> 

    delete(id: string): Promise<void> 
}